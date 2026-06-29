// AI Service - Client Side AI integration for tools
import { toast } from "sonner";
import { supabase } from "../supabase";
import { requestD1 } from "./d1Client";
import { getSubjectSpecificInstructions } from "./prompts/subjectPrompts";

export interface AIProvider {
  apiKey: string;
  enabled: boolean;
  defaultModel: string;
  availableModels: string[];
  useCustomServer: boolean;
  customApiKey: string;
  customBaseURL: string;
}

export interface AIConfig {
  activeProvider: "openai" | "gemini" | "groq" | "deepseek";
  providers: Record<"openai" | "gemini" | "groq" | "deepseek", AIProvider>;
  generationParams: { temperature: number; maxTokens: number; frequencyPenalty: number; presencePenalty: number };
  chatAssistantEnabled: boolean;
}

const AI_STORAGE_KEY = "plx:ai_config";

const DEFAULT_AI_CONFIG: AIConfig = {
  activeProvider: "openai",
  providers: {
    openai: { apiKey: "", enabled: true, defaultModel: "gpt-4o", availableModels: ["gpt-4o", "gpt-4o-mini"], useCustomServer: false, customApiKey: "", customBaseURL: "" },
    gemini: { 
      apiKey: "", 
      enabled: false, 
      defaultModel: "gemini-2.5-flash", 
      availableModels: [
        "gemini-3.5-flash",
        "gemini-3.5-flash-thinking",
        "gemini-3.1-pro",
        "gemini-3.1-pro-enhanced",
        "gemini-auto",
        "gemini-3.5-flash-thinking-lite",
        "gemini-flash-lite",
        "gemini-3.1-flash-lite-preview",
        "gemini-3.1-pro-preview",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.5-flash-lite"
      ], 
      useCustomServer: false, 
      customApiKey: "", 
      customBaseURL: "" 
    },
    groq: { apiKey: "", enabled: false, defaultModel: "llama-3.1-70b-versatile", availableModels: ["llama-3.1-70b-versatile"], useCustomServer: false, customApiKey: "", customBaseURL: "" },
    deepseek: { apiKey: "", enabled: false, defaultModel: "deepseek-v4-flash", availableModels: ["deepseek-v4-flash", "deepseek-v4-pro"], useCustomServer: false, customApiKey: "", customBaseURL: "" },
  },
  generationParams: { temperature: 0.7, maxTokens: 2000, frequencyPenalty: 0.0, presencePenalty: 0.0 },
  chatAssistantEnabled: true,
};

let isSynced = false;

export async function syncAIConfigWithSupabase(): Promise<void> {
  if (isSynced) return;
  try {
    const data = await requestD1<any>('/api/site-configs/ai_config');
      
    if (data && data.value) {
      const globalConfig = data.value;
      const localRaw = localStorage.getItem(AI_STORAGE_KEY);
      const localParsed = localRaw ? JSON.parse(localRaw) : {};
      
      const mergedProviders = { ...DEFAULT_AI_CONFIG.providers };
      
      const sourceProviders = globalConfig.providers || localParsed.providers || {};
      Object.keys(mergedProviders).forEach((key) => {
        const provKey = key as keyof typeof DEFAULT_AI_CONFIG.providers;
        mergedProviders[provKey] = {
          ...mergedProviders[provKey],
          ...(sourceProviders[provKey] || {})
        };
      });
      
      const newConfig = {
        ...DEFAULT_AI_CONFIG,
        ...globalConfig,
        providers: mergedProviders
      };
      
      localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(newConfig));
      isSynced = true;
    }
  } catch (e) {
    console.warn("Error syncing AI config from D1:", e);
  }
}

let isPromptsSynced = false;

export async function syncSubjectPromptsWithD1(): Promise<void> {
  if (isPromptsSynced) return;
  try {
    const data = await requestD1<any>('/api/site-configs/subject_prompts');
    if (data && data.value) {
      localStorage.setItem('plx:site_config:subject_prompts', JSON.stringify(data.value));
      isPromptsSynced = true;
    }
  } catch (e) {
    console.warn("Error syncing subject prompts from D1:", e);
  }
}

export function loadAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (!raw) return DEFAULT_AI_CONFIG;
    
    const parsed = JSON.parse(raw);
    const mergedProviders = { ...DEFAULT_AI_CONFIG.providers };
    
    if (parsed.providers) {
      Object.keys(parsed.providers).forEach((key) => {
        const provKey = key as keyof typeof DEFAULT_AI_CONFIG.providers;
        if (mergedProviders[provKey]) {
          mergedProviders[provKey] = {
            ...mergedProviders[provKey],
            ...parsed.providers[provKey]
          };
        }
      });
    }
    
    return {
      ...DEFAULT_AI_CONFIG,
      ...parsed,
      providers: mergedProviders
    };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

function logToTerminal(type: string, provider: string, model: string, message: string, details?: any) {
  fetch('/api/log-terminal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, provider, model, message, details })
  }).catch(() => {
    // Ignore error in production or when not connected to local Vite dev server
  });
}

// Direct browser API calls


async function callOpenAI(
  apiKey: string,
  baseURL: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7,
  provider = "openai",
  responseFormat?: "json" | "text",
  maxTokens?: number
) {
  let url = baseURL || "https://api.openai.com/v1/chat/completions";
  if (baseURL) {
    let cleaned = baseURL.trim();
    while (cleaned.endsWith('/')) {
      cleaned = cleaned.slice(0, -1);
    }
    if (cleaned.toLowerCase().endsWith('/v1')) {
      cleaned = cleaned.slice(0, -3) + '/v1';
    }
    if (!cleaned.endsWith('/chat/completions') && !cleaned.includes('/chat/completions?')) {
      url = `${cleaned}/chat/completions`;
    } else {
      url = cleaned;
    }
  }

  const activeModel = model || "gpt-4o";
  console.log(`%c[AI-CALL-${provider.toUpperCase()}] Sending Request`, "color: #a855f7; font-weight: bold;", {
    url,
    model: activeModel,
    temperature,
    systemPromptLength: systemPrompt?.length || 0,
    userPromptLength: userPrompt?.length || 0,
    maxTokens
  });

  logToTerminal("REQUEST", provider, activeModel, `Enviando petición de chat completions a ${url}`);

  try {
    const bodyParams: any = {
      model: activeModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature,
    };

    if (maxTokens) {
      bodyParams.max_tokens = maxTokens;
    }

    if (responseFormat === "json") {
      bodyParams.response_format = { type: "json_object" };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(bodyParams)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const errMsg = err.error?.message || `Error de API OpenAI: ${res.status}`;
      console.error(`%c[AI-CALL-${provider.toUpperCase()}] Request Failed with Status ${res.status}`, "color: #ef4444; font-weight: bold;", errMsg);
      logToTerminal("ERROR", provider, activeModel, `La petición falló con estado ${res.status}: ${errMsg}`);
      throw new Error(errMsg);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    console.log(`%c[AI-CALL-${provider.toUpperCase()}] Response Received Successfully`, "color: #22c55e; font-weight: bold;", {
      completionTokens: data.usage?.completion_tokens,
      promptTokens: data.usage?.prompt_tokens,
      contentPreview: content.slice(0, 100) + (content.length > 100 ? "..." : "")
    });
    logToTerminal("SUCCESS", provider, activeModel, `Respuesta recibida exitosamente`, {
      tokensPrompt: data.usage?.prompt_tokens,
      tokensGenerados: data.usage?.completion_tokens
    });
    return content;
  } catch (error: any) {
    console.error(`%c[AI-CALL-${provider.toUpperCase()}] Connection/Request Error`, "color: #ef4444; font-weight: bold;", error);
    logToTerminal("ERROR", provider, activeModel, `Error de conexión/petición: ${error.message || error}`);
    throw error;
  }
}

async function callGemini(
  apiKey: string,
  baseURL: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7,
  responseFormat?: "json" | "text",
  maxTokens?: number
) {
  // If using custom server (which behaves like OpenAI API)
  if (baseURL) {
    return callOpenAI(apiKey, baseURL, model, systemPrompt, userPrompt, temperature, "gemini", responseFormat, maxTokens);
  }

  const modelName = model || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  console.log(`%c[AI-CALL-GEMINI-OFFICIAL] Sending Request`, "color: #3b82f6; font-weight: bold;", {
    model: modelName,
    temperature,
    systemPromptLength: systemPrompt?.length || 0,
    userPromptLength: userPrompt?.length || 0,
    maxTokens
  });

  logToTerminal("REQUEST", "gemini", modelName, `Enviando petición oficial de Gemini a ${url.split('?')[0]}`);

  try {
    const generationConfig: any = {
      temperature,
    };

    if (maxTokens) {
      generationConfig.maxOutputTokens = maxTokens;
    }

    if (responseFormat === "json") {
      generationConfig.responseMimeType = "application/json";
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const errMsg = err.error?.message || `Gemini API error: ${res.status}`;
      console.error(`%c[AI-CALL-GEMINI-OFFICIAL] Request Failed with Status ${res.status}`, "color: #ef4444; font-weight: bold;", errMsg);
      logToTerminal("ERROR", "gemini", modelName, `La petición oficial falló con estado ${res.status}: ${errMsg}`);
      throw new Error(errMsg);
    }
    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log(`%c[AI-CALL-GEMINI-OFFICIAL] Response Received Successfully`, "color: #22c55e; font-weight: bold;", {
      contentPreview: content.slice(0, 100) + (content.length > 100 ? "..." : "")
    });
    logToTerminal("SUCCESS", "gemini", modelName, "Respuesta recibida exitosamente desde la API Oficial de Gemini");
    return content;
  } catch (error: any) {
    console.error(`%c[AI-CALL-GEMINI-OFFICIAL] Connection/Request Error`, "color: #ef4444; font-weight: bold;", error);
    logToTerminal("ERROR", "gemini", modelName, `Error de conexión/petición oficial: ${error.message || error}`);
    throw error;
  }
}

async function callGroq(
  apiKey: string,
  baseURL: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7,
  responseFormat?: "json" | "text",
  maxTokens?: number
) {
  const url = baseURL || "https://api.groq.com/openai/v1/chat/completions";
  return callOpenAI(apiKey, url, model || "llama-3.1-70b-versatile", systemPrompt, userPrompt, temperature, "groq", responseFormat, maxTokens);
}

async function callDeepSeek(
  apiKey: string,
  baseURL: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7,
  responseFormat?: "json" | "text",
  maxTokens?: number
) {
  const url = baseURL || "https://api.deepseek.com/v1/chat/completions";
  return callOpenAI(apiKey, url, model || "deepseek-v4-flash", systemPrompt, userPrompt, temperature, "deepseek", responseFormat, maxTokens);
}

export async function generateToolContent(tool: string, message: string, customSystemPrompt?: string): Promise<any> {
  await syncAIConfigWithSupabase();
  const config = loadAIConfig();
  const provider = config.activeProvider;
  const provConf = config.providers[provider];

  const apiKey = (provConf.useCustomServer ? provConf.customApiKey : provConf.apiKey) || (provConf.useCustomServer ? "no-key-needed" : "");
  const baseURL = provConf.useCustomServer ? provConf.customBaseURL : "";
  const model = provConf.defaultModel;

  let systemPrompt = customSystemPrompt || "";

  if (!systemPrompt) {
    if (tool === "simplifica") {
      systemPrompt = `Eres "Planix Simplifica", un experto pedagogo maestro de la Técnica de Feynman.
      Simplifica el tema indicado y responde estrictamente en JSON con la siguiente estructura:
      {
        "concept": "Explicación técnica formal del concepto (máximo 2 líneas)",
        "feynman_explanation": "Explicación simplificada usando analogías para niños y frases en **negrita**",
        "analogy": "Una analogía potente y visual con frases clave en **negrita**",
        "key_points": ["Punto clave 1", "Punto clave 2", "Punto clave 3"],
        "lesson_plan": {
          "inicio": "Inicio de la clase (10 min) con **negritas**",
          "desarrollo": "Desarrollo de la clase (25 min) con **negritas**",
          "cierre": "Cierre de la clase (10 min) con **negritas**"
        }
      }`;
    } else if (tool === "bienestar") {
      systemPrompt = `Eres "Planix Bienestar v2", experto en psicología educativa.
      Responde estrictamente en JSON con la siguiente estructura:
      {
        "validation": "Validación empática corta de la situación",
        "analysis": {
          "pedagogical": "Análisis pedagógico enfocado en el aula",
          "specialist": "Análisis especializado con terminología clínica"
        },
        "questions": ["Pregunta reflexiva 1?", "Pregunta reflexiva 2?"],
        "intervention_plan": {
          "phases": [
            { "name": "Fase 1: Acercamiento", "tasks": ["Tarea 1", "Tarea 2"], "goal": "Meta de esta fase" },
            { "name": "Fase 2: Ejecución", "tasks": ["Tarea 1", "Tarea 2"], "goal": "Meta de la ejecución" }
          ],
          "indicators": ["Indicador de progreso 1", "Indicador de progreso 2"]
        },
        "strategies": [
          { "title": "Técnica recomendada", "steps": ["Paso A", "Paso B"], "why": "Por qué funciona" }
        ],
        "is_urgent": false
      }`;
    } else if (tool === "sopa-de-letras") {
      systemPrompt = `Genera un listado de palabras temáticas para sopa de letras.
      Responde estrictamente en JSON con esta estructura:
      {
        "words": ["PALABRA1", "PALABRA2", "PALABRA3"]
      }`;
    } else if (tool === "crucigrama") {
      systemPrompt = `Genera pistas y respuestas para crucigrama educativo.
      Responde estrictamente en JSON con esta estructura:
      {
        "clues": [
          { "answer": "PALABRA1", "clue": "Definición o pista de la palabra", "direction": "horizontal" },
          { "answer": "PALABRA2", "clue": "Definición o pista de la palabra", "direction": "vertical" }
        ]
      }`;
    } else if (tool === "generador-preguntas") {
      systemPrompt = `Genera 3 preguntas de opción múltiple basadas en la Taxonomía de Bloom (Niveles: Recordar, Comprender, Aplicar).
      Responde estrictamente en JSON con esta estructura:
      {
        "questions": [
          { "nivel": "Recordar", "pregunta": "¿...?", "opciones": ["A", "B", "C"], "correcta": 0 },
          { "nivel": "Comprender", "pregunta": "¿...?", "opciones": ["A", "B", "C"], "correcta": 1 }
        ]
      }`;
    } else if (tool === "generador-examenes") {
      systemPrompt = `Genera un examen formal del tema.
      Responde estrictamente en JSON con esta estructura:
      {
        "questions": [
          { "tipo": "Selección Múltiple", "enunciado": "¿...?", "opciones": ["A", "B", "C", "D"], "respuestaCorrecta": "A" },
          { "tipo": "Falso o Verdadero", "enunciado": "La Tierra es plana", "opciones": ["Verdadero", "Falso"], "respuestaCorrecta": "Falso" }
        ]
      }`;
    } else if (tool === "steam") {
      systemPrompt = `Genera un proyecto educativo STEAM formal para República Dominicana.
      Responde estrictamente en JSON con esta estructura:
      {
        "project_header": {
          "title": "Título del proyecto",
          "driving_question": "¿Pregunta generadora?",
          "justification": "Justificación del proyecto",
          "general_objective": "Objetivo general",
          "target_audience": "Grado objetivo",
          "involved_teachers": "Áreas participantes"
        },
        "curriculum_alignment": {
          "competencias_fundamentales": [
            { "name": "Ética y Ciudadana", "link": "Cómo se trabaja" },
            { "name": "Pensamiento Lógico, Creativo y Crítico", "link": "Cómo se trabaja" }
          ],
          "competencias_especificas": ["Competencia 1", "Competencia 2"],
          "indicadores_logro": ["Indicador 1", "Indicador 2"]
        },
        "steam_integration": {
          "science": "Ciencia",
          "technology": "Tecnología",
          "engineering": "Ingeniería",
          "arts": "Arte",
          "math": "Matemática"
        },
        "academic_commitments": {
          "vocational_promotion": "Vocación científica",
          "math_science_improvement": "Mejora en cálculo",
          "scientific_english": "Inglés científico",
          "community_involvement": "Participación familiar"
        },
        "gamification_engine": {
          "narrative": "Una historia épica dominicana para motivar",
          "levels": ["Nivel 1: Recluta", "Nivel 2: Maestro"],
          "mechanics": {
            "points_system": "Sistema de puntos",
            "badges": ["Insignia A: Detalle", "Insignia B: Detalle"],
            "challenges": ["Reto 1", "Reto 2"]
          },
          "leaderboard_suggestion": "Sugerencia de ranking"
        },
        "phases": {
          "fase1_lanzamiento": "Lanzamiento",
          "fase2_organizacion": "Organización",
          "fase3_indagacion": "Indagación",
          "fase4_ejecucion": "Ejecución",
          "fase5_comunicacion": "Comunicación final"
        },
        "interactive_activities": [
          { "type": "Quiz", "description": "Detalle del quiz" }
        ],
        "final_products": ["Entregable 1", "Entregable 2"],
        "evaluation": {
          "rubric_criteria": [
            { "aspect": "Originalidad", "excellent": "Excelente", "good": "Bueno", "needs_improvement": "A mejorar" }
          ],
          "self_evaluation_questions": ["¿Qué aprendí?"]
        },
        "dominican_touch": "Detalle de identidad cultural dominicana"
      }`;
    } else if (tool === "additional-support") {
      systemPrompt = `Genera un plan de apoyo psicopedagógico inclusivo (DUA).
      Responde estrictamente en JSON con la siguiente estructura:
      {
        "strategies": ["Estrategia DUA 1", "Estrategia DUA 2", "Estrategia DUA 3"],
        "adjustments": "Ajuste razonable de materiales",
        "evaluation_tips": "Sugerencias de evaluación inclusiva"
      }`;
    } else if (tool === "situations") {
      systemPrompt = `Genera una situación de aprendizaje realista en base al currículo dominicano.
      Responde estrictamente en JSON con esta estructura:
      {
        "context": "Descripción del escenario local problemático",
        "conflict": "El problema a resolver por los alumnos",
        "action": "Lo que harán los alumnos para resolverlo",
        "product": "El producto final tangible esperado"
      }`;
    } else if (tool === "teacher-script") {
      systemPrompt = `Genera un recorrido docente / guion de andamiaje para la clase.
      Responde estrictamente en JSON con esta estructura:
      {
        "intro_hook": "Pregunta de gancho inicial",
        "scaffolding_questions": ["Pregunta clave de ayuda 1", "Pregunta de profundización 2"],
        "common_misconceptions": [{"error": "Error típico", "correction": "Cómo guiarlo"}],
        "exit_ticket": "Pregunta de ticket de salida"
      }`;
    }
  }

  // If no API Key, use local Mock Generator immediately
  if (!apiKey) {
    console.warn(`[AI Service] No hay API Key configurada para ${provider}. Usando fallback local.`);
    return getMockContent(tool, message);
  }

  try {
    let result = "";
    if (provider === "openai") {
      result = await callOpenAI(apiKey, baseURL, model, systemPrompt, message);
    } else if (provider === "gemini") {
      result = await callGemini(apiKey, baseURL, model, systemPrompt, message);
    } else if (provider === "groq") {
      result = await callGroq(apiKey, baseURL, model, systemPrompt, message);
    } else if (provider === "deepseek") {
      result = await callDeepSeek(apiKey, baseURL, model, systemPrompt, message);
    }

    // Clean JSON wrapper if present
    const cleaned = result.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(`[AI Service] Error calling ${provider}:`, error);
    toast.error(`Error de IA con ${provider}. Usando datos de simulación local.`);
    return getMockContent(tool, message);
  }
}

// Full premium mock definitions for offline use or when keys are missing
function getMockContent(tool: string, message: string): any {
  if (tool === "simplifica") {
    return {
      concept: `La fotosíntesis es el proceso mediante el cual las plantas producen glucosa y oxígeno utilizando la luz solar, agua y dióxido de carbono.`,
      feynman_explanation: `Imagina que las hojas de una planta son como una **fábrica de galletas**. 
      La fábrica tiene tres ingredientes principales:
      1. **Agua** que toman de las raíces en el suelo.
      2. **Dióxido de carbono** que respiran del aire.
      3. **Luz del sol** que es como la electricidad de la fábrica.
      Cuando la luz solar brilla, la planta usa esa energía para mezclar el agua y el aire y cocinar su propio alimento (llamado glucosa). 
      ¡Como residuo, liberan **oxígeno** para que nosotros podamos respirar!`,
      analogy: `Es como un **horno solar**: usas la energía del sol para transformar ingredientes crudos (agua y aire) en un delicioso pastel (glucosa) que te da fuerzas.`,
      key_points: ["La luz solar es la fuente de energía principal.", "Se produce glucosa como alimento y oxígeno como desecho.", "La clorofila capta la energía solar y da el color verde."],
      lesson_plan: {
        inicio: "Lluvia de ideas: ¿De qué se alimentan las plantas? ¿Tienen boca? Introducir la idea de la 'fábrica solar' en la hoja.",
        desarrollo: "Dibujar la hoja y colocar flechas para el Sol (energía), Dióxido de carbono (entra) y Oxígeno (sale). Explicar la clorofila.",
        cierre: "Preguntar a los niños: Si tapamos una planta en una caja oscura, ¿podrá hacer fotosíntesis? ¿Por qué?"
      }
    };
  }

  if (tool === "bienestar") {
    return {
      validation: "Entiendo completamente tu frustración. Gestionar un aula de primaria numerosa requiere un esfuerzo emocional tremendo y es normal sentirse agotado.",
      analysis: {
        pedagogical: "El grupo presenta dificultades para autorregularse debido a la sobreestimulación tras el recreo. Se recomienda establecer una rutina de transición predecible.",
        specialist: "El comportamiento disrupting generalizado se asocia con picos de cortisol tras actividad física intensa. Se requiere técnicas de bio-retroalimentación y co-regulación sensorial."
      },
      questions: [
        "¿Cuáles son los momentos del día donde el comportamiento es más pacífico?",
        "¿Hay algún alumno líder que guíe el desorden al que podamos asignarle un rol positivo?"
      ],
      intervention_plan: {
        phases: [
          { name: "Fase 1: Transición Sosegada", tasks: ["Implementar la campana del silencio tras el recreo", "Hacer 2 minutos de respiración profunda en sus asientos"], goal: "Bajar la frecuencia cardíaca promedio del grupo" },
          { name: "Fase 2: Gamificación del Orden", tasks: ["Asignar roles de 'Guardianes del Aula'", "Premio grupal al finalizar el día si no hay gritos"], goal: "Fomentar el control cooperativo" }
        ],
        indicators: ["Reducción del tiempo de transición de 15 a 5 minutos.", "Menor cantidad de interrupciones vocales durante la explicación."]
      },
      strategies: [
        { title: "El Semáforo del Ruido", steps: ["Dibujar un semáforo en la pizarra", "Colocar el marcador en amarillo al subir la voz", "Si llega a rojo, pausar la actividad 1 minuto"], why: "Proporciona retroalimentación visual directa al cerebro del estudiante." }
      ],
      is_urgent: false
    };
  }

  if (tool === "sopa-de-letras") {
    return {
      words: ["FOTOSINTESIS", "CLOROFILA", "PLANTA", "SOLAR", "OXIGENO", "GLUCOSA", "RAIZ", "HOJA"]
    };
  }

  if (tool === "crucigrama") {
    return {
      clues: [
        { answer: "FOTOSINTESIS", clue: "Proceso químico de las plantas para producir su alimento.", direction: "horizontal" },
        { answer: "OXIGENO", clue: "Gas vital que liberan las plantas y respiran los humanos.", direction: "vertical" },
        { answer: "CLOROFILA", clue: "Pigmento verde que atrapa la luz solar en las hojas.", direction: "horizontal" },
        { answer: "GLUCOSA", clue: "El azúcar que produce la planta y que le sirve de alimento.", direction: "vertical" }
      ]
    };
  }

  if (tool === "generador-preguntas") {
    return {
      questions: [
        { nivel: "Recordar", pregunta: "¿Qué pigmento da a las plantas su característico color verde?", opciones: ["Caroteno", "Clorofila", "Melanina"], correcta: 1 },
        { nivel: "Comprender", pregunta: "¿Cuál es el principal gas de desecho que liberan las plantas en la fotosíntesis?", opciones: ["Dióxido de carbono", "Oxígeno", "Nitrógeno"], correcta: 1 },
        { nivel: "Aplicar", pregunta: "Si colocas una planta bajo una luz roja potente en lugar del sol, ¿realizará fotosíntesis?", opciones: ["Sí, porque la clorofila puede absorber luz roja", "No, solo funciona con luz solar natural", "No, la luz artificial quema las hojas inmediatamente"], correcta: 0 }
      ]
    };
  }

  if (tool === "generador-examenes") {
    return {
      questions: [
        { tipo: "Selección Múltiple", enunciado: "¿Cuál es la función principal de las raíces?", opciones: ["Atrapar la luz solar", "Absorber agua y nutrientes del suelo", "Producir flores", "Liberar oxígeno al aire"], respuestaCorrecta: "Absorber agua y nutrientes del suelo" },
        { tipo: "Falso o Verdadero", enunciado: "Las plantas respiran dióxido de carbono y liberan oxígeno durante la fotosíntesis.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Verdadero" },
        { tipo: "Completar", enunciado: "La sustancia química encargada de absorber la energía solar se llama ______________.", opciones: ["Clorofila", "Agua", "Glucosa", "Dióxido de carbono"], respuestaCorrecta: "Clorofila" }
      ]
    };
  }

  if (tool === "steam") {
    return {
      project_header: {
        title: "Guardianes de la Clorofila: El Huerto Escolar Dominicano",
        driving_question: "¿Cómo podemos diseñar un huerto escolar autosostenible adaptado a nuestra comunidad?",
        justification: "El proyecto atiende la falta de áreas verdes y el desconocimiento de prácticas agrícolas en las escuelas dominicanas, estimulando la alimentación sana y el cuidado ecológico.",
        general_objective: "Diseñar, sembrar y monitorear un huerto escolar en base a principios científicos y geométricos.",
        target_audience: "4to de Primaria",
        involved_teachers: "Ciencias de la Naturaleza, Matemáticas, Artística y Lengua Española"
      },
      curriculum_alignment: {
        competencias_fundamentales: [
          { name: "Pensamiento Lógico, Creativo y Crítico", link: "Calculando áreas de siembra y diseñando el croquis del huerto." },
          { name: "Ambiental y de la Salud", link: "Cuidando el suelo escolar y comprendiendo la nutrición natural." }
        ],
        competencias_especificas: ["Analiza la estructura de las plantas y sus necesidades vitales.", "Aplica medidas de superficie para organizar áreas de cultivo."],
        indicadores_logro: ["Distingue los factores necesarios para la fotosíntesis.", "Calcula el perímetro y área de parcelas rectangulares."]
      },
      steam_integration: {
        science: "Estudio del crecimiento de semillas, tipos de suelo y el ciclo de fotosíntesis de hortalizas.",
        technology: "Uso de Excel o tablas para registrar crecimiento, y búsqueda web de plagas comunes.",
        engineering: "Construcción física de bancales de siembra y diseño de un sistema simple de riego por goteo con botellas plásticas recicladas.",
        arts: "Decoración creativa de macetas y carteles de identificación para cada vegetal del huerto.",
        math: "Medición de distancias de siembra, conteo de hojas y cálculo de áreas de cultivo."
      },
      academic_commitments: {
        vocational_promotion: "Encuentro con un ingeniero agrónomo local para conocer la carrera.",
        math_science_improvement: "Recolección de datos reales de altura de plantas y graficación semanal.",
        scientific_english: "Aprendizaje de términos técnicos: 'photosynthesis', 'irrigation', 'germination'.",
        community_involvement: "Invitación a los padres para la gran cosecha escolar."
      },
      gamification_engine: {
        narrative: "Los estudiantes forman parte de la 'Misión Germinar RD'. Cada equipo es una división de exploración espacial encargada de terraformar un sector del patio escolar.",
        levels: ["Nivel 1: Sembrador Novato", "Nivel 2: Guardián de la Clorofila", "Nivel 3: Ingeniero Agrónomo Espacial"],
        mechanics: {
          points_system: "Puntos de Nutrientes (obtenidos por riego diario y limpieza de bancales)",
          badges: ["Insignia H2O (por riego puntual)", "Insignia Botánico (por identificar plagas)", "Insignia Cosecha de Oro (por trabajo en equipo)"],
          challenges: ["El Reto del Riego Inteligente", "El Desafío de la Compostera Escolar"]
        },
        leaderboard_suggestion: "Pizarra de crecimiento donde cada grupo avanza un cohete en la pared según sus XP acumulados."
      },
      phases: {
        fase1_lanzamiento: "Fase 1: Presentación de la narrativa. Análisis del terreno escolar. Germinación en vasos plásticos.",
        fase2_organizacion: "Fase 2: Creación de equipos y roles. Dibujo del croquis del huerto aplicando geometría de perímetros.",
        fase3_indagacion: "Fase 3: Investigación de qué plantas hortalizas crecen rápido en República Dominicana (ej. ají, lechuga).",
        fase4_ejecucion: "Fase 4: Siembra real en la tierra y construcción de los bancales utilizando botellas plásticas.",
        fase5_comunicacion: "Fase 5: Día del Huerto Abierto. Presentación de ensaladas preparadas por los estudiantes a la comunidad escolar."
      },
      interactive_activities: [
        { type: "Quiz", description: "Identificar los componentes de la tierra fértil en un juego rápido de preguntas." }
      ],
      final_products: ["Bancal de siembra escolar", "Cuaderno de registro botánico", "Croquis a escala del huerto"],
      evaluation: {
        rubric_criteria: [
          { aspect: "Trabajo Cooperativo", excellent: "Todos colaboran con el riego y cuidado.", good: "La mayoría colabora activamente.", needs_improvement: "Poca participación grupal." }
        ],
        self_evaluation_questions: ["¿Cómo ayudó mi equipo a que las plantas crecieran?", "¿Qué parte de la siembra me costó más?"]
      },
      dominican_touch: "Uso de plantas locales como el ají gustoso, tomates criollos y abono orgánico casero."
    };
  }

  if (tool === "additional-support") {
    return {
      strategies: [
        "**Instrucciones breves y segmentadas**: Dividir el tema 'Fotosíntesis' en 3 pasos clave: Entrada (agua/aire), Cocción (luz solar) y Salida (glucosa/oxígeno), evitando sobrecarga de información.",
        "**Apoyo visual y kinestésico**: Utilizar dibujos grandes con tarjetas móviles para representar el agua, sol y aire, permitiendo que el alumno los manipule en la pizarra.",
        "**Monitoreo frecuente y pausas activas**: Realizar una pausa de 1 minuto para estirarse a la mitad de la explicación y validar comprensión con señas de pulgar arriba/abajo."
      ],
      adjustments: "Proporcionar una ficha adaptada con dibujos para colorear y menor cantidad de texto escrito, usando oraciones cortas y pictogramas.",
      evaluation_tips: "Permitir la evaluación oral o mediante maquetas físicas, valorando la identificación de las flechas del proceso por encima de la redacción escrita."
    };
  }

  if (tool === "situations") {
    return {
      context: "En el sector de Sabana Perdida, los moradores reportan cúmulos de desechos plásticos que obstruyen las cañadas y provocan inundaciones leves con cada lluvia.",
      conflict: "Los estudiantes de 5to grado de Primaria de la Escuela República de Colombia observan esta situación y se preguntan cómo pueden concienciar al barrio y reutilizar ese plástico.",
      action: "Los alumnos investigan sobre reciclaje, organizan una campaña de recolección de botellas plásticas en el centro y diseñan macetas colgantes para el huerto escolar.",
      product: "Campaña de concienciación vecinal y huerto escolar vertical de botellas recicladas."
    };
  }

  if (tool === "teacher-script") {
    return {
      intro_hook: "¿Saben cómo hacen las plantas para desayunar si no tienen cocina ni mamás que les hagan comida?",
      scaffolding_questions: [
        "Si miramos la tierra de la maceta, ¿está húmeda o seca? ¿Por qué la planta necesita esa humedad?",
        "¿De dónde creen que saca la planta la energía para convertir el agua en su alimento?"
      ],
      common_misconceptions: [
        { error: "Pensar que las plantas comen tierra", correction: "Guiar al alumno preguntando si el nivel de tierra en la maceta disminuye cuando la planta crece, demostrando que la tierra aporta soporte y minerales, pero no es la comida principal." }
      ],
      exit_ticket: "En una hoja pequeña, dibuja las dos cosas que entran a la planta y la única cosa gaseosa que sale para nosotros."
    };
  }

  return {
    success: true,
    result: `Simulación local completa de ${tool} para el prompt: ${message}`
  };
}

export interface RubricGenerationRequest {
  criteria: string;
  numCriteria: number;
  type: 'RUBRIC' | 'CHECKLIST';
  educationLevel: 'primaria' | 'secundaria';
  language?: string;
}

export async function generateRubric(request: RubricGenerationRequest): Promise<any> {
  await syncAIConfigWithSupabase();
  const config = loadAIConfig();
  const provider = config.activeProvider;
  const provConf = config.providers[provider];

  const apiKey = (provConf.useCustomServer ? provConf.customApiKey : provConf.apiKey) || (provConf.useCustomServer ? "no-key-needed" : "");
  const baseURL = provConf.useCustomServer ? provConf.customBaseURL : "";
  const model = provConf.defaultModel;

  if (!apiKey) {
    console.warn(`[AI Service] No hay API Key configurada para ${provider}. Usando fallback local.`);
    return getMockRubricContent(request);
  }

  const isSecundaria = request.educationLevel === "secundaria";
  const type = request.type || "RUBRIC";

  const systemPrompt = "Eres un Especialista en Evaluación Educativa del MINERD con experiencia en el diseño de rúbricas analíticas y listas de cotejo.";

  const userPrompt = `
    Actúa como un Especialista en Evaluación Educativa del MINERD de República Dominicana.
    
    TU OBJETIVO:
    Crear un instrumento de evaluación (${type === 'CHECKLIST' ? 'Lista de Cotejo' : 'Rúbrica Analítica'}) basado en el siguiente criterio/indicador de logro:
    "${request.criteria}"
    
    CONTEXTO EDUCATIVO:
    El docente pertenece al nivel ${request.educationLevel}.
    
    IDIOMA DE RESPUESTA: ${request.language === 'en' ? 'Inglés' : 'Español'}.
    
    ESTRUCTURA DEL INSTRUMENTO:
    ${type === 'CHECKLIST'
      ? `Es una Lista de Cotejo. Debes definir exactamente ${request.numCriteria || 5} indicadores binarios (de presencia/ausencia).`
      : isSecundaria 
        ? `Es una Rúbrica Analítica para SECUNDARIA. La rúbrica debe tener exactamente 4 niveles de desempeño socioformativo:
           1. Receptivo (RC) - Nivel inicial/apoyo constante.
           2. Resolutivo (R) - Nivel funcional/procedimental.
           3. Autónomo (A) - Nivel independiente/iniciativa.
           4. Estratégico (E) - Nivel superior/creatividad/riesgos.
           Debes definir exactamente ${request.numCriteria || 3} dimensiones (aspectos a evaluar).`
        : `Es una Rúbrica Analítica para PRIMARIA. La rúbrica debe tener exactamente 3 niveles de desempeño:
           1. Elemental (E)
           2. Aceptable (A)
           3. Satisfactorio (S)
           Debes definir exactamente ${request.numCriteria || 3} dimensiones (aspectos a evaluar).`
    }
    
    RESPUESTA JSON OBLIGATORIA (Devuelve únicamente un JSON válido, sin textos introductorios ni bloques Markdown):
    {
      "title": string, // Título del instrumento. IMPORTANTE: El título debe ser SOLO el nombre del tema o indicador. NO incluyas prefijos como "Lista de Cotejo para", "Rúbrica Analítica de" o "Evaluación de". Ejemplo: "Lectura Correcta".
      "description": string, // Breve descripción (Máximo 20 palabras)
      "indicator": string, // El indicador original
      "type": "${type}",
      "educationLevel": "${request.educationLevel}",
      "dimensions": [
        {
          "aspect": string, // Dimensión o Indicador de la lista
          "levels": {
            ${type === 'CHECKLIST' ? `
            "logrado": string,
            "no_logrado": string
            ` : isSecundaria ? `
            "receptivo": string,
            "resolutivo": string,
            "autonomo": string,
            "estrategico": string
            ` : `
            "elemental": string,
            "aceptable": string,
            "satisfactorio": string
            `}
          }
        }
      ]
    }
  `;

  try {
    let result = "";
    if (provider === "openai") {
      result = await callOpenAI(apiKey, baseURL, model, systemPrompt, userPrompt);
    } else if (provider === "gemini") {
      result = await callGemini(apiKey, baseURL, model, systemPrompt, userPrompt);
    } else if (provider === "groq") {
      result = await callGroq(apiKey, baseURL, model, systemPrompt, userPrompt);
    } else if (provider === "deepseek") {
      result = await callDeepSeek(apiKey, baseURL, model, systemPrompt, userPrompt);
    }

    const cleaned = result.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(`[AI Service] Error calling ${provider} for rubric:`, error);
    toast.error(`Error al conectar con la IA de ${provider}. Usando simulación local.`);
    return getMockRubricContent(request);
  }
}

function getMockRubricContent(request: RubricGenerationRequest): any {
  const isSecundaria = request.educationLevel === "secundaria";
  const isChecklist = request.type === "CHECKLIST";

  const mockDimensions = [];
  const aspects = [
    "Comprensión del Tema", "Organización y Estructura", "Aplicación Práctica", 
    "Uso de Vocabulario", "Resolución y Creatividad"
  ];

  for (let i = 0; i < Math.min(request.numCriteria, aspects.length); i++) {
    const aspect = aspects[i];
    if (isChecklist) {
      mockDimensions.push({
        aspect,
        levels: {
          logrado: `Demuestra de forma consistente el indicador para ${aspect.toLowerCase()}.`,
          no_logrado: `No logra demostrar de forma autónoma el indicador para ${aspect.toLowerCase()}.`
        }
      });
    } else if (isSecundaria) {
      mockDimensions.push({
        aspect,
        levels: {
          receptivo: `Muestra comprensión mínima de ${aspect.toLowerCase()} y requiere tutoría continua.`,
          resolutivo: `Logra resolver y aplicar ${aspect.toLowerCase()} de manera básica.`,
          autonomo: `Realiza de forma independiente las actividades de ${aspect.toLowerCase()}.`,
          estrategico: `Demuestra un dominio sobresaliente en ${aspect.toLowerCase()}, innovando en la aplicación.`
        }
      });
    } else {
      mockDimensions.push({
        aspect,
        levels: {
          elemental: `Presenta dificultades básicas en ${aspect.toLowerCase()}, logrando completar únicamente con apoyo.`,
          aceptable: `Logra cumplir satisfactoriamente con la mayor parte de ${aspect.toLowerCase()}.`,
          satisfactorio: `Consigue realizar y explicar con total claridad, orden y autonomía todo lo relacionado a ${aspect.toLowerCase()}.`
        }
      });
    }
  }

  return {
    title: request.criteria.length > 30 ? request.criteria.substring(0, 30) + "..." : request.criteria,
    description: `Evaluación formativa diseñada por IA sobre: ${request.criteria}`,
    indicator: request.criteria,
    type: request.type,
    educationLevel: request.educationLevel,
    dimensions: mockDimensions
  };
}

// Helper generic runner for AI assistants
async function runAICall(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7,
  responseFormat: "json" | "text" = "json"
): Promise<any> {
  await syncAIConfigWithSupabase();
  const config = loadAIConfig();
  const provider = config.activeProvider;
  const provConf = config.providers[provider];
  const maxTokens = config.generationParams?.maxTokens || 2000;

  let apiKey = (provConf.useCustomServer ? provConf.customApiKey : provConf.apiKey) || (provConf.useCustomServer ? "no-key-needed" : "");
  if (!apiKey) {
    if (provider === "gemini") {
      apiKey = process.env.GEMINI_API_KEY || "";
    } else if (provider === "openai") {
      apiKey = process.env.OPENAI_API_KEY || "";
    } else if (provider === "groq") {
      apiKey = process.env.GROQ_API_KEY || "";
    } else if (provider === "deepseek") {
      apiKey = process.env.DEEPSEEK_API_KEY || "";
    }
  }
  const baseURL = provConf.useCustomServer ? provConf.customBaseURL : "";
  const model = provConf.defaultModel;

  if (!apiKey) {
    throw new Error("API Key no configurada");
  }

  let result = "";
  if (provider === "openai") {
    result = await callOpenAI(apiKey, baseURL, model, systemPrompt, userPrompt, temperature, "openai", responseFormat, maxTokens);
  } else if (provider === "gemini") {
    result = await callGemini(apiKey, baseURL, model, systemPrompt, userPrompt, temperature, responseFormat, maxTokens);
  } else if (provider === "groq") {
    result = await callGroq(apiKey, baseURL, model, systemPrompt, userPrompt, temperature, responseFormat, maxTokens);
  } else if (provider === "deepseek") {
    result = await callDeepSeek(apiKey, baseURL, model, systemPrompt, userPrompt, temperature, responseFormat, maxTokens);
  }

  if (responseFormat === "json") {
    const cleaned = result.replace(/```json\n?|```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn("[AI Service] Falló parseo directo de JSON, intentando extracción por regex. Respuesta cruda:", result);
      
      const arrayMatch = result.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch (arrayErr: any) {
          console.error("[AI Service] Falló al parsear el JSON array extraído por regex:", arrayMatch[0], arrayErr);
          throw new Error(`El JSON de la IA está incompleto o malformado: ${arrayErr.message}`);
        }
      }
      
      const objectMatch = result.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        try {
          return JSON.parse(objectMatch[0]);
        } catch (objErr: any) {
          console.error("[AI Service] Falló al parsear el JSON objeto extraído por regex:", objectMatch[0], objErr);
          throw new Error(`El JSON de la IA está incompleto o malformado: ${objErr.message}`);
        }
      }
      
      throw new Error(`La IA no devolvió un formato JSON estructurado válido. Respuesta recibida: "${result.slice(0, 150)}${result.length > 150 ? '...' : ''}"`);
    }
  }
  return result;
}

// 1. Bloom Leveler Service
export async function generateBloom(activities: string, targetLevel: string, language: string = "es"): Promise<any> {
  const systemPrompt = "Eres un Especialista en Diseño Tecno-Pedagógico experto en la Taxonomía de Bloom.";
  const userPrompt = `
    Actúa como un Especialista en Diseño Tecno-Pedagógico experto en la Taxonomía de Bloom.
    
    TU OBJETIVO:
    Analizar las siguientes actividades y ajustar su exigencia cognitiva para que correspondan exactamente al NIVEL OBJETIVO indicado.
    
    IDIOMA DE RESPUESTA: ${language === 'en' ? 'Inglés' : 'Español'}.
    
    ACTIVIDADES ORIGINALES:
    "${activities}"
    
    NIVEL OBJETIVO: ${targetLevel || 'Superior (Crear/Evaluar)'}
    
    TU TAREA:
    1. Identifica el nivel actual de Bloom de las actividades (Recordar, Comprender, Aplicar, Analizar, Evaluar, Crear).
    2. Reescribe las actividades para que alcancen el nivel ${targetLevel || 'Superior'}. Si el nivel incluye "Primario", adapta el lenguaje y la complejidad para niños.
    3. Asegúrate de que el cambio no sea solo de verbos, sino de la profundidad de la tarea.
    
    RESPUESTA JSON OBLIGATORIA (Devuelve únicamente un JSON válido, sin textos introductorios ni bloques Markdown):
    {
      "current_level": string,
      "analysis": string,
      "leveled_activities": string,
      "suggested_verbs": string[]
    }
  `;

  try {
    return await runAICall(systemPrompt, userPrompt, 0.8);
  } catch (error) {
    console.warn("[AI Service] Fallback a simulación Bloom local por error:", error);
    return {
      current_level: "Comprender / Recordar",
      analysis: `Las actividades originales tienen una baja exigencia cognitiva centrándose únicamente en la identificación mecánica. Se eleva a un nivel de ${targetLevel} para involucrar análisis comparativo y expresión activa.`,
      leveled_activities: `[Nivel: ${targetLevel}] Los estudiantes colaboran en parejas para explorar y categorizar las palabras clave del letrero, contrastando su significado e ilustrando sus conclusiones en una cartelera del aula.`,
      suggested_verbs: ["Categorizar", "Contrastar", "Crear"]
    };
  }
}

// 2. PEDI / Inclusion Service
export async function generateInclusion(originalActivities: string, condition: string, language: string = "es"): Promise<any> {
  const systemPrompt = "Eres un Especialista en Educación Inclusiva y Psicopedagogía del MINERD.";
  const userPrompt = `
    Actúa como un Especialista en Educación Inclusiva y Psicopedagogía del MINERD (República Dominicana).
    
    TU OBJETIVO:
    Adaptar las siguientes actividades pedagógicas para un estudiante con la condición: "${condition}".
    
    IDIOMA DE RESPUESTA: ${language === 'en' ? 'Inglés' : 'Español'}.
    
    ACTIVIDADES ORIGINALES:
    ${JSON.stringify(originalActivities)}
    
    REQUISITOS DE LA ADAPTACIÓN:
    1. Mantener el mismo Indicador de Logro o intención pedagógica original.
    2. No simplificar el contenido curricular en sí, sino adaptar la FORMA de acceso, ejecución o expresión.
    3. Seguir los principios del DUA (Diseño Universal para el Aprendizaje).
    4. Si es dislexia: priorizar soporte visual y oral. Si es TDAH: fragmentar en pasos e instrucciones cortas.
    
    RESPUESTA JSON OBLIGATORIA (Devuelve únicamente un JSON válido, sin textos introductorios ni bloques Markdown):
    {
      "adapted_activities": string, // Texto detallado de la secuencia adaptada (Inicio, Desarrollo y Cierre)
      "pedagogical_advice": string, // Consejo psicopedagógico breve para el maestro en el aula
      "resources_needed": string[] // Recursos de apoyo específicos recomendados
    }
  `;

  try {
    return await runAICall(systemPrompt, userPrompt, 0.7);
  } catch (error) {
    console.warn("[AI Service] Fallback a simulación Inclusión local por error:", error);
    return {
      adapted_activities: `[Inicio: 10 min] Introducción visual de la secuencia apoyada por imágenes claras.
[Desarrollo: 30 min] Realizar la tarea en parejas, permitiendo soporte auditivo y el uso de letras móviles.
[Cierre: 10 min] Expresión oral del aprendizaje o señalamiento de dibujos correspondientes.`,
      pedagogical_advice: `Para la condición de ${condition}, mantenga instrucciones cortas y apoye las actividades escritas con recursos visuales y manipulativos.`,
      resources_needed: ["Tarjetas visuales", "Letras móviles", "Ficha con letra grande"]
    };
  }
}

// 3. Gamification Service
export async function generateGamify(intention: string, activities: string, language: string = "es"): Promise<any> {
  const systemPrompt = "Eres un Diseñador de Gamificación Educativa experto en dinámicas y mecánicas de juego en el aula.";
  const userPrompt = `
    Actúa como un Diseñador de Gamificación Educativa experto.
    
    TU OBJETIVO:
    Transformar la siguiente clase tradicional en una Experiencia Gamificada (Aprendizaje Basado en Juegos).
    
    IDIOMA DE RESPUESTA: ${language === 'en' ? 'Inglés' : 'Español'}.
    
    DATOS ORIGINALES:
    - Intención: "${intention}"
    - Actividades: "${activities}"
    
    ELEMENTOS A INCORPORAR:
    1. Narrativa: Un contexto de aventura o reto (ej: Misión espacial, detectives, Reino perdido).
    2. Mecánicas: Niveles, puntos (XP), insignias o retos contra reloj.
    3. Roles: Dividir a los estudiantes en equipos con funciones (ej: Explorador, Analista, Comunicador).
    
    RESPUESTA JSON OBLIGATORIA (Devuelve únicamente un JSON válido, sin textos introductorios ni bloques Markdown):
    {
      "game_title": string, // Título de la "Misión"
      "narrative": string, // Historia de fondo
      "gamified_activities": string, // Actividades modificadas
      "mechanics": string[], // Mecánicas utilizadas
      "rewards": string // Sugerencia de recompensa no física
    }
  `;

  try {
    return await runAICall(systemPrompt, userPrompt, 0.9);
  } catch (error) {
    console.warn("[AI Service] Fallback a simulación Gamificación local por error:", error);
    return {
      game_title: "Aventura: Los Guardianes del Letrero Mágico",
      narrative: "El gran letrero de la escuela ha perdido algunas de sus letras y el duendecillo del alfabeto necesita nuestra ayuda para reconstruirlo antes del mediodía.",
      gamified_activities: `Los niños asumen el rol de 'Detectives de Letras' organizados en grupos cooperativos. Cada grupo resolverá un rompecabezas de palabras usando letras móviles para desbloquear pistas en la pizarra y completar el letrero.`,
      mechanics: ["Puntos de Aventura (XP)", "Insignia de Detective Escolar", "Reto contrarreloj cooperativo"],
      rewards: "10 minutos adicionales de lectura lúdica o ser los líderes del juego del recreo."
    };
  }
}

// 4. Coherence Audit Service
export async function generateAudit(planData: any): Promise<any> {
  const systemPrompt = "Actúa como un Auditor Curricular y Supervisor Pedagógico del MINERD (República Dominicana).";
  
  const cleanSpecificCompetencies = (planData.competencias_especificas || [])
      .filter((c: string) => c && c.trim().length > 0);

  const userPrompt = `
    Actúa como un Auditor Curricular y Supervisor Pedagógico del MINERD (República Dominicana).

    TU MISIÓN: Evaluar la CALIDAD y COHERENCIA de una "Planificación por Secuencias" (Estrategia Con Base).

    INSTRUCCIONES DE ANÁLISIS:
    1. DETECCIÓN DE VACÍOS (CRÍTICO):
       - Revisa si hay campos vacíos u omitidos (Intención, Evaluación, Recursos, Momentos).
       - Un campo vacío penaliza severamente la puntuación (< 70).

    2. ANÁLISIS DE COHERENCIA (EL FACTOR CLAVE):
       - No basta con que haya texto; debe tener SENTIDO.
       - ¿Las actividades propuestas realmente ayudan a lograr la "Intención Pedagógica" descrita?
       - ¿Los recursos mencionados son útiles para esas actividades específicas?
       - ¿La evaluación (si existe) mide lo que se enseñó en los momentos?

    3. CONTEXTO MINERD:
       - Intención: Si es general pero relevante al tema, es ACEPTABLE.
       - Recursos: Verifica que cada MOMENTO tenga sus propios recursos listados.
       - Competencias: Valora que las "Fundamentales" estén alineadas con el propósito de la clase.

    Devuelve ÚNICAMENTE este JSON (Devuelve únicamente un JSON válido, sin textos introductorios ni bloques Markdown):
    {
      "score": número del 1-100,
      "is_coherent": boolean,
      "analysis": "Análisis pedagógico detallado de fallos y aciertos.",
      "issues": ["Campo vacío: X", "Incoherencia: Y"],
      "suggestions": ["Sugerencia para mejorar la alineación o coherencia"]
    }

    Audita esta planificación:

    **Datos Generales:**
    - Centro Educativo: ${planData.centro_educativo || 'N/A'}
    - Docente: ${planData.docente || 'N/A'}
    - Grado: ${planData.grado || 'N/A'}
    - Asignatura: ${planData.area || planData.asignatura || 'N/A'}
    - Secuencia: ${planData.sequence_title || planData.secuencia || 'N/A'}

    **Intención Pedagógica:**
    ${planData.intencion_pedagogica || 'No especificada'}

    **Competencias Fundamentales:**
    ${(planData.competencias && planData.competencias.length > 0) ? planData.competencias.join(', ') : 'No especificadas'}

    **Competencias Específicas:**
    ${(cleanSpecificCompetencies.length > 0) ? cleanSpecificCompetencies.join('\n- ') : 'No especificadas'}

    **Momentos:**
    ${JSON.stringify(planData.momentos || [], null, 2)}

    **Evaluación:**
    ${planData.evaluacion || 'No especificada'}

    **Recursos Adicionales:**
    ${planData.recursos_adicionales || planData.recursos || 'No especificados'}
  `;

  try {
    return await runAICall(systemPrompt, userPrompt, 0.3);
  } catch (error) {
    console.warn("[AI Service] Fallback a simulación Auditoría local por error:", error);
    
    const hasIntencion = !!planData.intencion_pedagogica;
    const hasMomentos = planData.momentos && planData.momentos.length > 0;
    const hasEvaluacion = !!planData.evaluacion;
    
    let score = 90;
    const issues = [];
    const suggestions = [];
    
    if (!hasIntencion) {
      score -= 20;
      issues.push("Intención pedagógica vacía");
      suggestions.push("Escriba una intención pedagógica clara que describa el logro esperado en la sesión.");
    }
    if (!hasMomentos) {
      score -= 30;
      issues.push("Momentos de clase vacíos o no definidos");
      suggestions.push("Agregue al menos un momento de inicio, desarrollo o cierre.");
    }
    if (!hasEvaluacion) {
      score -= 15;
      issues.push("Evaluación no especificada");
      suggestions.push("Defina cómo evaluará el aprendizaje al final del día.");
    }

    return {
      score,
      is_coherent: score >= 70,
      analysis: score >= 80 
        ? "La planificación posee una estructura sólida y coherencia interna aceptable con alineación curricular."
        : "Se detectaron omisiones importantes en los campos requeridos para la supervisión oficial.",
      issues,
      suggestions: suggestions.length > 0 ? suggestions : ["Mantenga el uso de recursos concretos dominicanos."]
    };
  }
}

// 5. Coordinator Assistant Services
export async function generateCoordinatorChecklist(planData: any): Promise<string[]> {
  const systemPrompt = `Actúa como un Asistente de Supervisión Pedagógica del MINERD (República Dominicana).
  Analiza la planificación entregada y genera una lista de exactamente 10 criterios de evaluación específicos, lógicos y altamente usables para revisar esta planificación.
  Deben ser criterios directos que se puedan marcar como cumplidos o no.
  Devuelve ÚNICAMENTE un array JSON de strings con los 10 criterios. Ejemplo:
  [
    "Criterio 1",
    "Criterio 2"
  ]`;

  const userPrompt = `
  Analiza esta planificación:
  - Asignatura: ${planData.area || planData.asignatura || 'N/A'}
  - Secuencia: ${planData.secuencia || planData.actividad_titulo || 'N/A'}
  - Intención Pedagógica: ${planData.intencion_pedagogica || 'No especificada'}
  - Momentos de la Clase: ${JSON.stringify(planData.momentos || [])}
  `;

  try {
    const list = await runAICall(systemPrompt, userPrompt, 0.7, "json");
    if (Array.isArray(list)) return list;
    if (list && Array.isArray(list.criterios)) return list.criterios;
    if (list && Array.isArray(list.checklist)) return list.checklist;
    throw new Error("Formato no soportado");
  } catch (error) {
    console.warn("[AI Service] Fallback a criterios predefinidos por error:", error);
    return [
      "Objetivos alineados al currículo dominicano",
      "Estrategias diferenciadas presentes",
      "Evaluación coherente con los objetivos",
      "Recursos disponibles en la institución",
      "Tiempos por actividad explícitos",
      "Contenidos e Indicadores articulados",
      "Competencias Específicas bien seleccionadas",
      "Secuencia metodológica clara (Inicio, Desarrollo, Cierre)",
      "Inclusión de atención a la diversidad",
      "Evidencias de aprendizaje definidas"
    ];
  }
}

export async function generateCoordinatorFeedback(planData: any, selectedCriteria: { label: string, checked: boolean }[], decision: string): Promise<string> {
  const systemPrompt = `Actúa como un Coordinador Pedagógico experimentado de República Dominicana.
  Escribe una retroalimentación/notas de mejora constructiva y profesional para el docente basada en la decisión tomada y los criterios evaluados.
  El texto debe ser conciso, directo, muy profesional (máximo 3-4 líneas, unas 60-80 palabras). No uses asteriscos ni markdown, solo texto plano en un único párrafo.`;

  const checkedList = selectedCriteria.filter(c => c.checked).map(c => c.label);
  const uncheckedList = selectedCriteria.filter(c => !c.checked).map(c => c.label);

  const userPrompt = `
  Planificación: "${planData.secuencia || planData.actividad_titulo || 'N/A'}"
  Asignatura: "${planData.area || planData.asignatura || 'N/A'}"
  Decisión del Coordinador: **${decision}**
  
  Criterios CUMPLIDOS:
  ${checkedList.length > 0 ? checkedList.map(c => `- ${c}`).join('\n') : 'Ninguno'}
  
  Criterios NO CUMPLIDOS (Puntos de mejora):
  ${uncheckedList.length > 0 ? uncheckedList.map(c => `- ${c}`).join('\n') : 'Ninguno'}
  `;

  try {
    const text = await runAICall(systemPrompt, userPrompt, 0.7, "text");
    if (typeof text === 'string') {
      return text.replace(/```json\n?|```/g, "").replace(/"/g, "").trim();
    }
    if (text && text.feedback) return text.feedback;
    return String(text);
  } catch (error) {
    console.warn("[AI Service] Fallback a feedback local por error:", error);
    if (decision === 'Aprobar') {
      return `Excelente planificación, alineada correctamente con los indicadores curriculares y los momentos de la clase. Sigue adelante con esta metodología de secuencias.`;
    } else if (decision === 'Devolver') {
      return `Se sugiere revisar la coherencia de los momentos de clase y ajustar las estrategias de atención a la diversidad para asegurar que todos los estudiantes logren los indicadores.`;
    } else {
      return `Favor coordinar una reunión presencial en la oficina pedagógica para revisar los detalles del plan diario de clase y mejorar el diseño de la evaluación.`;
    }
  }
}

// 6. Evaluation and Metacognition Generator
export async function generateEvaluationAndMeta(planData: any): Promise<any> {
  const systemPrompt = "Eres un experto en pedagogía dominicana del MINERD. Responde ÚNICAMENTE con el objeto JSON solicitado.";
  
  const userPrompt = `
    Actúa como un Especialista en Currículo y Evaluación Educativa del MINERD (República Dominicana).
    
    TU OBJETIVO:
    Generar el cierre de una planificación diaria, específicamente los campos de Metacognición y Evaluación.
    
    CONTEXTO DE LA PLANIFICACIÓN:
    - Área: ${planData.asignatura || 'Lengua Española'}
    - Grado: ${planData.grado || 'Primaria'}
    - Secuencia Didáctica / Eje Temático: ${planData.secuencia || 'No especificada'} (PRIORIDAD ALTA)
    - Intención Pedagógica: ${planData.intencion_pedagogica || 'No especificada'}
    - Momentos de la Clase (Estrategias y Actividades): 
      ${(planData.momentos || []).map((m: any, i: number) => `Momento ${i + 1} (${m.moment || 'Actividad'}): ${m.descripcion || m.description}`).join('\n') || 'No especificados'}
    
    REQUERIMIENTOS ESTRICTOS DE FORMATO:
    
    1. METACOGNICIÓN:
       - Genera de 4 a 6 preguntas de reflexión enfocadas estrictamente en la metacognición del estudiante (pensar sobre su propio aprendizaje y su proceso cognitivo). Redáctalas en un formato de lista con viñetas (•).
       - Deben incluir preguntas como: ¿Qué aprendimos hoy? ¿Cómo lo aprendimos? ¿Qué fue lo más fácil o divertido y qué nos costó más trabajo? ¿Cómo pudimos resolver las dificultades? ¿Cómo nos sentimos al realizar la actividad? ¿Para qué nos sirve lo que aprendimos hoy?
       - IMPORTANTE: No agregues ninguna sección externa como "Dinámica de conexión con la vida diaria" ni tareas para el hogar. Limítate únicamente a las preguntas de reflexión metacognitiva sobre el proceso de aprendizaje.
    
    2. EVALUACIÓN:
       - Debe referirse EXPLÍCITAMENTE a lo realizado en el momento de DESARROLLO de la clase.
       - Debe ser precisa y no muy extensa.
       - Formato OBLIGATORIO:
         * Técnica: (Nombre de la técnica o técnicas empleadas, ej: Observación Sistemática)
         
         * Criterios Observables:
           • (Criterio específico 1 con viñeta •)
           • (Criterio específico 2 con viñeta •)
           • (Criterio específico 3 con viñeta •)
           
         * Evidencia:
           • (Producto o desempeño tangible 1 con viñeta •)
           • (Producto o desempeño tangible 2 con viñeta •)
           
         * Instrumento: (Ej: Lista de Cotejo, Rúbrica, Registro Anecdótico)
    
    RESPUESTA JSON OBLIGATORIA (Devuelve únicamente un JSON válido, sin textos introductorios ni bloques Markdown):
    {
      "metacognicion": "Preguntas para la reflexión:\n• ¿Qué descubrimos hoy...?\n• ¿Cómo lo aprendimos...?\n• ¿Qué parte fue la más divertida...?",
      "evaluacion": "Técnica: ...\n\nCriterios Observables:\n• ...\n\nEvidencia:\n• ...\n\nInstrumento: ..."
    }
  `;

  try {
    return await runAICall(systemPrompt, userPrompt, 0.7);
  } catch (error) {
    console.warn("[AI Service] Fallback a simulación Evaluación/Metacognición local por error:", error);
    return {
      metacognicion: `Preguntas para la reflexión:
• ¿Qué descubrimos hoy sobre las vocales en los nombres de nuestros compañeros y compañeras?
• ¿Por qué es importante saber identificar las vocales en los nombres y en otras palabras?
• ¿Cómo nos ayudó el juego de armar los nombres con letras móviles a entender mejor las palabras?
• ¿En qué situaciones de tu día a día (fuera de la escuela) crees que te ayudará saber reconocer las vocales?
• ¿Qué fue lo más fácil de aprender hoy y qué fue lo más desafiante? ¿Cómo lo superamos?`,
      evaluacion: `Técnica: Observación Sistemática y Registro Anecdótico.

Criterios Observables:
• Reconoce y señala las vocales (a, e, i, o, u) en los nombres propios, como se evidenció en el juego de la clase.
• Colabora en el armado de nombres propios con letras móviles, ordenando las letras correctamente según la secuencia planteada.
• Identifica nombres y palabras que inician con una vocal específica, respondiendo a las consignas del docente.
• Copia la fecha en su cuaderno, demostrando la identificación de letras y la noción de espacio entre palabras.

Evidencia:
• Desempeño y participación activa en los juegos con letras móviles y de identificación de vocales.
• Producción escrita de la fecha en el cuaderno de los estudiantes.
• Respuestas orales a las preguntas sobre identificación de vocales en nombres y palabras.

Instrumento: Lista de Cotejo`
    };
  }
}

// 6. Complementary Activities Generator
export async function generateComplementaryActivities(planData: any): Promise<any> {
  const systemPrompt = `Eres un Especialista en Pedagogía Inclusiva, Diferenciación y Diseño DUA del MINERD (Ministerio de Educación de la República Dominicana).
Tus respuestas deben ser extremadamente detalladas, profesionales y prácticas para el docente dominicano en el aula.`;

  const gradeName = planData.grado || '1er Grado de Primaria';
  const userPrompt = `
    Actúa como un Especialista en Pedagogía Inclusiva y Diferenciación Curricular del MINERD, experto en el programa oficial de alfabetización inicial "Con Base".
    
    TU OBJETIVO:
    Crear actividades complementarias de Refuerzo (para estudiantes con dificultades de aprendizaje o que necesitan mayor apoyo) y de Ampliación (para estudiantes con rendimiento avanzado) basadas en la siguiente sesión de clase de ${gradeName}.
    
    INFORMACIÓN DE LA CLASE:
    - Grado: ${gradeName}
    - Asignatura: ${planData.asignatura || 'Lengua Española'}
    - Secuencia/Tema: ${planData.secuencia || ''}
    - Intención Pedagógica: ${planData.intencion_pedagogica || ''}
    - Momentos de la Clase (Actividades principales del día): 
      ${(planData.momentos || []).map((m: any, i: number) => `Momento ${i + 1} (${m.moment || m.titulo || 'Actividad'}): ${m.descripcion || m.description}`).join('\n') || 'No especificados'}
    
    REQUISITOS DEL CONTENIDO:
    1. Actividad de Refuerzo (Grupo de Apoyo):
       - Debe centrarse en la alfabetización inicial, la conciencia fonológica y la correspondencia fonema-grafema, alineada con el programa "Con Base".
       - Debe proponer una dinámica lúdica y multisensorial, explicando de forma detallada y paso a paso cómo guiar al estudiante.
       - Incluye el uso de materiales manipulativos concretos (como letras móviles de madera/plástico, tarjetas de identidad con fotografía de gran tamaño, cajas de arena/arroz para el trazo motor, imanes, etc.).
       - Explica cómo la manipulación física y el andamiaje reducen la carga cognitiva y ayudan a consolidar la correspondencia grafema-fonema.
       - Escribe un título atractivo (sin usar etiquetas Markdown como ### o ##).
       - La descripción debe ser amplia, descriptiva, profesional y de al menos 120-180 palabras.
       
    2. Actividad de Ampliación (Grupo Avanzado):
       - Debe plantear un reto cognitivo de nivel superior para los estudiantes que terminan rápido.
       - Debe promover la escritura autónoma, la producción de textos con sentido, la conciencia fonológica avanzada o el pensamiento analítico y creativo.
       - Propón retos de escritura creativa (como inventar oraciones divertidas que asocien nombres de compañeros con animales/objetos que inicien con la misma consonante, clasificar nombres por extensión -largos o cortos- contando letras, etc.).
       - Escribe un título atractivo (sin usar etiquetas Markdown como ### o ##).
       - La descripción debe ser amplia, descriptiva, profesional y de al menos 120-180 palabras.
    
    RESPUESTA JSON OBLIGATORIA (Devuelve únicamente un JSON válido, sin textos introductorios ni bloques Markdown):
    {
      "refuerzo": {
        "titulo": string, // Título atractivo de la actividad de refuerzo
        "descripcion": string // Descripción muy detallada, lúdica y procedimental (120-180 palabras)
      },
      "ampliacion": {
        "titulo": string, // Título atractivo de la actividad de ampliación
        "descripcion": string // Descripción detallada, retadora y creativa (120-180 palabras)
      }
    }
  `;

  try {
    return await runAICall(systemPrompt, userPrompt, 0.7);
  } catch (error) {
    console.warn("[AI Service] Fallback a simulación de actividades complementarias por error:", error);
    return {
      refuerzo: {
        titulo: "¡Los Detectives de los Sonidos con Letras Móviles!",
        descripcion: "Para los estudiantes que necesitan mayor apoyo visual y manipulativo, organizaremos una estación de andamiaje con el uso prioritario de letras móviles y tarjetas de identidad con fotografía de gran tamaño. El docente o tutor se sienta con este grupo pequeño y modela el sonido fonémico de las consonantes trabajadas (M, S, N, P, D, L, T). La actividad consiste en el juego 'Pesca de Consonantes': se colocan las tarjetas de identidad en la mesa y el estudiante, usando un imán o de forma manual, debe asociar una letra móvil de madera o plástico (por ejemplo, la 'M') con el inicio del nombre de un compañero que tenga su tarjeta al lado (por ejemplo, 'María'). El estudiante traza la letra en una caja de arena o arroz con su dedo para fijar el patrón motor y luego coloca la letra móvil sobre la primera letra de la tarjeta. Finalmente, el docente le ayuda a verbalizar el sonido de forma exagerada y lúdica: '¡Mmm de Mateo!'. Esta manipulación multisensorial reduce la carga cognitiva y fortalece la correspondencia grafema-fonema de manera concreta."
      },
      ampliacion: {
        titulo: "¡Creadores del Gran Diccionario de Nombres de la Clase!",
        descripcion: "Los estudiantes con rendimiento avanzado que terminen rápidamente las actividades del fascículo asumirán el reto cognitivo superior de crear un 'Minidiccionario de Identidad'. Se les entregará un cuadernillo en blanco dividido por las consonantes del día. Su tarea será identificar a tres compañeros cuyos nombres empiecen con las consonantes estudiadas, escribir sus nombres de forma autónoma respetando la direccionalidad, y proponer un reto creativo adicional: inventar y escribir una oración simple o frase divertida que asocie el nombre de su compañero con un objeto o animal que empiece con la misma consonante (por ejemplo: 'Santiago salta como un sapo' o 'María come mango'). Además, deberán clasificar los nombres según su extensión (largos o cortos) contando el número de consonantes que posee cada uno. Esto estimula la conciencia fonológica avanzada, la producción de textos escritos con sentido y el pensamiento analítico."
      }
    };
  }
}

function getMockChatResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("nivel de lectura") || lower.includes("bajar el nivel") || lower.includes("nivel")) {
    return `### 📖 Texto Adaptado: Nivel de Lectura Simplificado
    
He adaptado el texto para hacerlo más accesible y fácil de comprender para tus estudiantes, manteniendo los conceptos clave:

**Texto Original Simplificado:**
"Las plantas utilizan la clorofila en sus hojas para captar la luz solar. Con esta energía, transforman el agua del suelo y el aire (dióxido de carbono) en azúcares que les sirven de alimento, liberando oxígeno como resultado."

**Estrategias aplicadas:**
* Vocabulario sencillo sin perder rigor técnico.
* Oraciones cortas y directas.
* Uso de la analogía de la "fábrica de galletas solares" en las hojas.`;
  }
  if (lower.includes("hoja de trabajo") || lower.includes("hoja") || lower.includes("trabajo")) {
    return `### 📝 Hoja de Trabajo Pedagógica
    
**Tema:** Cuidado del Medio Ambiente  
**Grado:** 4to de Primaria  

**Actividad 1: Une con una línea ✏**
* Dióxido de carbono $\\rightarrow$ El aire que respiran las plantas
* Clorofila $\\rightarrow$ Lo que da el color verde y capta el sol
* Oxígeno $\\rightarrow$ El gas limpio que nos regalan las plantas

**Actividad 2: Reflexiona y escribe 💭**
¿Por qué crees que debemos evitar tirar basura en las calles de nuestra comunidad? Escribe dos razones con tus propias palabras.`;
  }
  if (lower.includes("planificación") || lower.includes("planificar") || lower.includes("clase")) {
    return `### 📊 Secuencia Didáctica Sugerida (Clase Diaria)
    
**Tema:** Las Fracciones en la Vida Diaria  
**Intención Pedagógica:** Identificar y representar fracciones comunes (1/2, 1/4) usando objetos reales.

* **Inicio (10 min):** Mostrar una manzana física y cortarla a la mitad frente a la clase. Preguntar: ¿Cómo llamamos ahora a cada una de estas partes?
* **Desarrollo (25 min):** En parejas, usar círculos de cartulina divididos en 2 y 4 partes. Resolver ejercicios gráficos de colorear y nombrar la fracción.
* **Cierre (10 min):** Ticket de salida: Dibujar un rectángulo en el cuaderno y colorear exactamente la mitad (1/2).`;
  }
  if (lower.includes("rúbrica") || lower.includes("evaluación")) {
    return `### 🏫 Rúbrica Analítica de Desempeño
    
**Criterio:** Exposición oral sobre las efemérides patrias.

| Nivel de Desempeño | Descripción |
| :--- | :--- |
| **Satisfactorio / Estratégico** | Explica con claridad la efeméride, mantiene buen volumen de voz y responde preguntas del grupo autónomamente. |
| **Aceptable / Autónomo** | Expone el tema con fluidez apoyado en recursos visuales, aunque titubea al responder preguntas complejas. |
| **Elemental / Receptivo** | Lee directamente el material de apoyo y requiere orientación constante del docente para finalizar.`;
  }
  if (lower.includes("comentario") || lower.includes("libreta") || lower.includes("boletas") || lower.includes("comentarios")) {
    return `### 📋 Comentarios Sugeridos para Reportes de Calificaciones
    
Aquí tienes opciones profesionales de retroalimentación constructiva para tus estudiantes:

**Opción A (Destacado):**
*"[Nombre] muestra una excelente actitud participativa y demuestra un gran dominio de las competencias del grado. ¡Continúa con ese entusiasmo!"*

**Opción B (A mejorar en conducta):**
*"[Nombre] posee un gran potencial académico; sin embargo, le cuesta mantener la concentración y seguir las pautas de orden en el aula. Le animamos a seguir mejorando."*

**Opción C (Refuerzo académico):**
*"[Nombre] ha mostrado avances significativos, pero requiere continuar repasando en casa la lectura diaria para consolidar su comprensión lectora."*`;
  }
  if (lower.includes("correo") || lower.includes("escribir un correo")) {
    return `### 💌 Plantilla de Correo a Tutores
    
**Asunto:** Apoyo escolar y felicitación por desempeño - Colegio Santo Domingo

Estimado tutor de [Nombre del Estudiante],

Es un placer saludarle. Me pongo en contacto con usted para informarle sobre el excelente desempeño y disposición de [Nombre] durante esta semana en el aula.

Para continuar fortaleciendo sus competencias en el área de [Asignatura], le sugerimos realizar un breve repaso en casa sobre [Tema] durante unos 10 minutos al día. 

Agradeciendo de antemano su valiosa colaboración en el proceso educativo,

Atentamente,  
**Profe Alejandro Pérez**`;
  }
  return `¡Hola! Como tu asesor pedagógico **Kali**, estoy listo para ayudarte. 

Puedes pedirme que:
* Adapte un texto difícil reduciendo su nivel de lectura para tus alumnos.
* Cree una hoja de trabajo con preguntas y actividades lúdicas.
* Elabore una rúbrica o lista de cotejo personalizada.
* Redacte una secuencia didáctica completa paso a paso.
* Prepare plantillas de correos cordiales para comunicarte con los padres.

¿Sobre qué tema o actividad te gustaría trabajar hoy?`;
}

export async function generateChatResponse(history: { role: 'user' | 'assistant'; content: string }[], userMessage: string): Promise<string> {
  await syncAIConfigWithSupabase();
  const config = loadAIConfig();
  const provider = config.activeProvider;
  const provConf = config.providers[provider];

  const apiKey = (provConf.useCustomServer ? provConf.customApiKey : provConf.apiKey) || (provConf.useCustomServer ? "no-key-needed" : "");
  const baseURL = provConf.useCustomServer ? provConf.customBaseURL : "";
  const model = provConf.defaultModel;

  const systemPrompt = `Eres "Planix Chat", un asistente de chat pedagógico altamente calificado y amable para la plataforma "Planix".
  Tu objetivo es ayudar a los docentes a planificar clases, crear rúbricas, resolver dudas de aula, bajar niveles de lectura de textos, proponer ideas DUA para alumnos con necesidades especiales, o redactar comentarios para libretas de calificaciones.
  Responde con un tono empático, constructivo, inspirador y profesional.
  Usa formato Markdown cuando sea pertinente (listas, negritas, código, etc.).
  Haz respuestas claras, estructuradas y útiles. Evita saludos muy largos y ve al grano con ideas creativas. Escribe siempre en Español.`;

  if (!apiKey) {
    console.warn(`[AI Service Chat] No hay API Key configurada para ${provider}. Usando fallback local.`);
    return getMockChatResponse(userMessage);
  }

  try {
    if (provider === "openai" || provConf.useCustomServer || provider === "groq" || provider === "deepseek") {
      let url = baseURL;
      if (!url) {
        if (provider === "openai") url = "https://api.openai.com/v1/chat/completions";
        else if (provider === "groq") url = "https://api.groq.com/openai/v1/chat/completions";
        else if (provider === "deepseek") url = "https://api.deepseek.com/v1/chat/completions";
      }

      const activeModel = model || (provider === "openai" ? "gpt-4o" : provider === "groq" ? "llama-3.1-70b-versatile" : "deepseek-v4-flash");

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Error status: ${res.status}`);
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    } else if (provider === "gemini") {
      const modelName = model || "gemini-2.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const contents = [
        ...history.map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
          contents,
          generationConfig: { temperature: 0.7 }
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Error status: ${res.status}`);
      }
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
    return getMockChatResponse(userMessage);
  } catch (err: any) {
    console.error(`Error de chat con ${provider}:`, err);
    return `Lo siento, ocurrió un error al comunicarme con el motor de IA (${provider}): ${err.message || err}. Usando respuesta simulada pedagógica:\n\n${getMockChatResponse(userMessage)}`;
  }
}

// 7. Saberes Previos Generator
export async function generateSaberesPrevios(planData: any): Promise<any> {
  const systemPrompt = "Eres un experto en pedagogía dominicana del MINERD. Responde ÚNICAMENTE con el objeto JSON solicitado.";
  const areaName = planData.area || planData.asignatura || 'Lengua Española';
  const gradeName = planData.grado || '1er Grado de Primaria';
  
  let userPrompt = "";
  if (planData.isCurricular) {
    userPrompt = `
      Actúa como un Especialista en Currículo con Adecuación Curricular del MINERD de República Dominicana.
      
      TU OBJETIVO:
      Generar los saberes previos sugeridos para una planificación diaria de ${areaName}.
      Los saberes previos deben plantear preguntas disparadoras o actividades cortas de diálogo que ayuden a identificar lo que los estudiantes ya conocen sobre este tema específico antes de comenzar la lección.
      
      CONTEXTO DE LA PLANIFICACIÓN CON ADECUACIÓN CURRICULAR:
      - Área / Asignatura: ${areaName}
      - Grado: ${gradeName}
      - Unidad: ${planData.unidad || 'No especificada'}
      - Tema: ${planData.tema || 'No especificado'}
      - Subtema: ${planData.subtema || 'No especificado'}
      - Intención Pedagógica: ${planData.intencion_pedagogica || 'No especificada'}
      
      RESPUESTA JSON OBLIGATORIA (Devuelve únicamente un JSON válido, sin textos introductorios ni bloques Markdown):
      {
        "saberes_previos": "Texto con viñetas conteniendo de 3 a 5 preguntas disparadoras o dinámicas lúdicas sugeridas para explorar los saberes previos de los niños de ${gradeName} sobre este tema específico, partiendo de la Unidad, Tema, Subtema e Intención Pedagógica indicados."
      }
    `;
  } else {
    userPrompt = `
      Actúa como un Especialista en Currículo del MINERD de República Dominicana.
      
      TU OBJETIVO:
      Generar los saberes previos sugeridos para una planificación diaria de ${areaName}.
      Los saberes previos deben plantear preguntas disparadoras o actividades cortas de diálogo que ayuden a identificar lo que los estudiantes ya conocen sobre este tema específico antes de comenzar la lección.
      
      CONTEXTO DE LA PLANIFICACIÓN:
      - Área: ${areaName}
      - Grado: ${gradeName}
      - Secuencia Didáctica / Eje Temático: ${planData.secuencia || 'No especificada'}
      - Bloque: ${planData.bloque || 'No especificado'}
      - Actividad: ${planData.actividad || 'No especificada'}
      - Intención Pedagógica: ${planData.intencion_pedagogica || 'No especificada'}
      - Momentos cargados (si los hay): ${planData.momentosText || 'No especificados'}
      
      RESPUESTA JSON OBLIGATORIA (Devuelve únicamente un JSON válido, sin textos introductorios ni bloques Markdown):
      {
        "saberes_previos": "Texto con viñetas conteniendo de 3 a 5 preguntas disparadoras o dinámicas lúdicas sugeridas para explorar los saberes previos de los niños de ${gradeName} sobre este tema específico."
      }
    `;
  }

  try {
    return await runAICall(systemPrompt, userPrompt, 0.7);
  } catch (error) {
    console.warn("[AI Service] Fallback a simulación Saberes Previos local por error:", error);
    if (planData.isCurricular) {
      return {
        saberes_previos: `• ¿Qué saben sobre ${planData.subtema || planData.tema || 'este tema'}?
• ¿Dónde han escuchado hablar de ${planData.tema || 'este tema'} en su comunidad o familia?
• Dinámica: Dialogar en círculo brevemente sobre la intención del día: "${planData.intencion_pedagogica || 'aprender juntos'}".`
      };
    }
    const isMath = areaName.toLowerCase().includes('matem');
    return {
      saberes_previos: isMath 
        ? `• ¿Qué números conocen ya? ¿Hasta qué número saben contar?
• ¿Dónde han visto números fuera de la escuela (casas, teléfonos, monedas)?
• Dinámica: Mostrar un grupo de 3 o 4 objetos y preguntar a los alumnos cuántos creen que hay a simple vista.`
        : `• ¿Han visto alguna vez un letrero en la calle o en la escuela? ¿Para qué sirven?
• ¿Qué letras o dibujos recuerdan haber visto en esos letreros?
• Dinámica: Mostrar una tarjeta con una palabra conocida y preguntar si alguien puede adivinar qué dice o identificar alguna letra inicial.`
    };
  }
}

// 8. Retroalimentación Generator
export async function generateRetroalimentacion(lastPlanData: any): Promise<any> {
  const systemPrompt = "Eres un experto en pedagogía dominicana del MINERD. Responde ÚNICAMENTE con el objeto JSON solicitado.";
  const areaName = lastPlanData.area || lastPlanData.asignatura || 'Lengua Española';
  const userPrompt = `
    Actúa como un Especialista en Evaluación Formativa y Retroalimentación del MINERD.
    
    TU OBJETIVO:
    Generar preguntas y actividades de retroalimentación (feedback) constructiva para la clase de hoy, basándote en lo que se enseñó en la ÚLTIMA planificación diaria (que sirve como punto de partida para repasar o conectar aprendizajes) del área de ${areaName}.
    
    DATOS DE LA ÚLTIMA PLANIFICACIÓN:
    - Área: ${areaName}
    - Título/Tema: ${lastPlanData.titulo || 'No especificado'}
    - Intención Pedagógica: ${lastPlanData.intencion_pedagogica || 'No especificada'}
    
    RESPUESTA JSON OBLIGATORIA (Devuelve únicamente un JSON válido, sin textos introductorios ni bloques Markdown):
    {
      "retroalimentacion": "Texto con viñetas conteniendo de 3 a 5 preguntas o dinámicas sugeridas para realizar una retroalimentación constructiva al inicio o cierre de la clase, recuperando lo aprendido en la sesión anterior de ${areaName}."
    }
  `;

  try {
    return await runAICall(systemPrompt, userPrompt, 0.7);
  } catch (error) {
    console.warn("[AI Service] Fallback a simulación Retroalimentación local por error:", error);
    return {
      retroalimentacion: `• ¿Qué recordamos sobre lo que hicimos ayer con ${lastPlanData.titulo || 'el tema anterior'}?
• ¿Quién puede compartir una palabra o idea clave que aprendimos en la última clase?
• Dinámica: Lanzar una pelota suave a un estudiante para que mencione un aprendizaje de ayer, y luego este la pase a otro compañero.`
    };
  }
}

export { getSubjectSpecificInstructions };

export async function generateDailyPlan(planData: {
  grado: string;
  asignatura: string;
  unidad?: string;
  tema?: string;
  subtema?: string;
  docente?: string;
  centro_educativo?: string;
  intencion_pedagogica?: string;
  bloque?: string;
  indicadores_disponibles?: string[];
}): Promise<any> {
  await syncSubjectPromptsWithD1();
  const systemPrompt = "Eres un asistente pedagógico experto en el currículo dominicano (MINERD). Responde ÚNICAMENTE con el objeto JSON solicitado.";
  const topic = planData.subtema || planData.tema || planData.unidad || "General";
  const grade = planData.grado || "1er Grado de Primaria";
  const intencion = planData.intencion_pedagogica || "";
  const block = planData.bloque || "";
  const indDisponibles = planData.indicadores_disponibles && planData.indicadores_disponibles.length > 0
    ? planData.indicadores_disponibles.map((x, idx) => `${idx + 1}. ${x.replace(/\*\*/g, '')}`).join("\n")
    : "No especificados. Infórmate y elígelos según el currículo oficial.";

  const userPrompt = `
    IMPORTANTE: Devuelve ÚNICAMENTE un objeto JSON válido. NO incluyas introducciones, explicaciones, comentarios ni saludos.
    ⚠️ RESTRICCIÓN: NO utilices Markdown ni ningún tipo de formato de negritas (ni **). Devuelve TEXTO PLANO exclusivamente.

    ${getSubjectSpecificInstructions(planData.asignatura, grade, planData.tema || "", intencion, planData.unidad || "", planData.subtema || "")}

    ═══════════════════════════════════════
    JERARQUÍA Y ALINEACIÓN CURRICULAR OBLIGATORIA
    ═══════════════════════════════════════
    La planificación debe derivarse estrictamente del contexto seleccionado:
    - Área: ${planData.asignatura || "Ciencias Sociales"}
    - Grado: ${grade}
    - Unidad: ${planData.unidad || "No especificada"}
    - Tema: ${planData.tema || "No especificado"}
    - Subtema: ${planData.subtema || "No especificado"}

    NO inventes temas diferentes, no cambies el enfoque de la unidad ni generes contenidos ajenos al tema o subtema.
    La intención pedagógica debe derivarse directamente del subtema, siendo clara, medible y alineada al grado.

    ═══════════════════════════════════════
    INDICADORES DE LOGRO DISPONIBLES (SELECCIÓN OBLIGATORIA)
    ═══════════════════════════════════════
    El docente dispone de los siguientes indicadores de logro en el desplegable para esta sesión:
    ${indDisponibles}

    DEBERÁS SELECCIONAR ESTRICTAMENTE entre 1 y 2 indicadores de la lista de indicadores disponibles mostrada arriba que mejor se aproximen y se alineen a la intención pedagógica.
    ⚠️ REGLA CRÍTICA: NO inventes ni redactes nuevos indicadores de logro. Debes seleccionar obligatoriamente entre 1 y 2 de los indicadores descritos en la lista anterior, copiándolos palabra por palabra tal como aparecen allí.

    ═══════════════════════════════════════
    ADAPTACIÓN AL GRADO Y REGLAS DE ESTILO
    ═══════════════════════════════════════
    - Escribe en tercera persona centrada en el docente ("El maestro...", "El docente...").
    - Adapta todas las actividades al nivel cognitivo del grado indicado.
    - Para primer ciclo de primaria (1ro a 3ro): Prioriza lenguaje sencillo, actividades manipulativas con material concreto, juegos, canciones, dramatizaciones y observación directa.
    - ⚠️ REGLA DE ORO: NO SEAS BREVE. GENERA PÁRRAFOS NARRATIVOS EXTENSOS Y DESCRIPTIVOS.
    - ⚠️ ALTA CREATIVIDAD Y ORIGINALIDAD PEDAGÓGICA: Diseña dinámicas sumamente atractivas, interactivas e innovadoras. Evita repetir ideas trilladas, aburridas o predecibles en los momentos de la clase (Inicio, Desarrollo, Cierre). Cada generación debe ser única, variando las estrategias didácticas y el uso lúdico de recursos para enriquecer la experiencia educativa.

    ═══════════════════════════════════════
    PRIORIDAD DE RECURSOS (MINERD REALISTA)
    ═══════════════════════════════════════
    Utiliza preferiblemente materiales disponibles en cualquier aula dominicana:
    - Cartulinas, láminas impresas, revistas, periódicos, objetos del entorno real, material reciclable, pizarra tradicional y cuadernos.
    Evita depender de proyectores, pizarras digitales o tablets, a menos que el tema lo requiera de forma indispensable.

    ═══════════════════════════════════════
    ESTRUCTURA DE LOS MOMENTOS Y TIEMPOS
    ═══════════════════════════════════════
    La suma total del tiempo de los tres momentos de la clase NO puede superar los 45 minutos.

    🟢 1. MOMENTO DE INICIO (Tiempo sugerido: 5 a 10 min | Mínimo 80-100 palabras)
    - Objetivo: Despertar interés, motivar e indagar saberes previos.
    - Redacción obligatoria: Comienza con frases como "El maestro introduce la clase...", "El docente inicia presentando...", etc.
    - Variedad: Usa estrategias dinámicas (láminas, objetos reales, recursos naturales, títeres, canciones, sonidos) específicas del tema. Evita repetir siempre la "caja misteriosa".

    🟢 2. MOMENTO DE DESARROLLO (Tiempo sugerido: 20 a 30 min | Mínimo 150-200 palabras)
    - Objetivo: Construcción profunda del aprendizaje. Debe ser la parte más extensa y detallada.
    - Contenido: El docente modela/explica usando material concreto, los alumnos manipulan/exploran, trabajo cooperativo y diálogo socrático de indagación. Evita descripciones genéricas.

    🟢 3. MOMENTO DE CIERRE (Tiempo sugerido: 5 a 10 min | Mínimo 60-80 palabras)
    - Objetivo: Consolidación, retroalimentación y verificación de aprendizajes.
    - Redacción obligatoria: Comienza con "Para cerrar, el docente...", "Finalmente, el maestro...", etc.
    - Actividad: Dinámica lúdica o preguntas orales para verificar el logro de la intención pedagógica.

    ═══════════════════════════════════════
    OTROS COMPONENTES
    ═══════════════════════════════════════
    - ESTRATEGIAS: Selecciona un máximo de tres estrategias coherentes de enseñanza-aprendizaje. OBLIGATORIO: Devuelve esta información en formato de lista con viñetas (•), una por línea (no en formato de párrafo corrido ni separado por comas).
    - INDICADORES DE LOGRO: Devuelve exactamente los 1 o 2 indicadores seleccionados de la lista de "INDICADORES DE LOGRO DISPONIBLES" mostrada arriba. Escríbelos palabra por palabra como aparecen en la lista, uno por línea.
    - METACOGNICIÓN: Genera entre 4 y 5 preguntas reflexivas sobre su propio aprendizaje y su aplicación diaria. OBLIGATORIO: Devuelve esta información en formato de lista con viñetas (•), una por línea (no en formato de párrafo corrido ni separado por comas).
    - EVALUACIÓN FORMATIVA: Criterios observables de evaluación formativa (participación, interacción, uso de materiales) sin calificaciones numéricas. OBLIGATORIO: Devuelve esta información en formato de lista con viñetas (•), uno por línea (no en formato de párrafo corrido ni separado por comas).
    - TAREA PARA EL HOGAR: Actividad sencilla adecuada al grado que pueda realizarse en casa, involucrando el entorno familiar.

    ═══════════════════════════════════════
    CONTEXTO ACTUAL (Respetar datos ingresados):
    ═══════════════════════════════════════
    - Grado: ${grade}
    - Tema/Eje: "${topic}"
    - Bloque/Actividad: ${block}
    - Intencion Pedagógica: "${intencion}"

    Esquema JSON Requerido:
    {
      "intencion_pedagogica": "texto sugerido",
      "estrategia": "Estrategias de enseñanza sugeridas en formato de lista con viñetas (•), una por línea, sin comas",
      "indicador_logro": "Los 1 o 2 indicadores seleccionados de la lista, separados por salto de línea",
      "metacognicion": "Preguntas de metacognición sugeridas en formato de lista con viñetas (•), una por línea, sin comas",
      "evaluacion": "Criterios de evaluación sugeridos en formato de lista con viñetas (•), uno por línea, sin comas",
      "tarea_casa": "Tarea sugerida para el hogar",
      "momentos": [
        {
          "descripcion": "Narrativa detallada del INICIO",
          "tiempo": "10 min",
          "recursos": "Recursos necesarios"
        },
        {
          "descripcion": "Narrativa detallada del DESARROLLO",
          "tiempo": "25 min",
          "recursos": "Recursos necesarios"
        },
        {
          "descripcion": "Narrativa detallada del CIERRE",
          "tiempo": "10 min",
          "recursos": "Recursos necesarios"
        }
      ]
    }
  `;

  try {
    return await runAICall(systemPrompt, userPrompt, 0.95);
  } catch (error) {
    console.warn("[AI Service] Fallback a simulación plan diario local por error:", error);
    const selectedFallback = planData.indicadores_disponibles && planData.indicadores_disponibles.length > 0
      ? planData.indicadores_disponibles.slice(0, 2).map(x => x.replace(/\*\*/g, '')).join("\n")
      : `Identifica elementos fundamentales sobre ${topic}.`;

    return {
      intencion_pedagogica: intencion || `Identificar y comprender aspectos del tema ${topic} en su vida diaria.`,
      estrategia: "Estrategias de indagación dialógica, socialización centrada en actividades grupales y aprendizaje basado en el juego.",
      indicador_logro: selectedFallback,
      metacognicion: `Preguntas para reflexionar:
• ¿Qué aprendimos hoy sobre ${topic}?
• ¿Cómo lo aprendimos?
• ¿Qué fue lo más fácil o divertido y qué nos costó más trabajo?`,
      evaluacion: `Técnica: Observación Sistemática y Registro de Desempeño.
Criterios: Participación activa, uso adecuado de materiales didácticos, respeto a las opiniones de los compañeros.
Instrumento: Lista de Cotejo`,
      tarea_casa: `Dibuja en tu cuaderno una actividad relacionada con ${topic} que realices junto a tu familia.`,
      momentos: [
        {
          descripcion: `El docente inicia presentando el tema del día, ${topic}, a través de un títere narrador que les cuenta una breve historia motivadora. Los alumnos escuchan con atención y responden preguntas previas sobre la historia de forma lúdica.`,
          tiempo: "10 min",
          recursos: "Títere, pizarra"
        },
        {
          descripcion: `El docente explica el concepto central de ${topic} apoyándose en láminas gigantes ilustradas. Posteriormente, organiza a los niños en grupos pequeños y les proporciona material concreto para que exploren, clasifiquen y conversen sobre el tema.`,
          tiempo: "25 min",
          recursos: "Láminas gigantes, materiales didácticos"
        },
        {
          descripcion: `Para cerrar, el docente propone el juego de la papa caliente para recordar las ideas aprendidas hoy. Los estudiantes participan entusiastas compartiendo sus ideas finales.`,
          tiempo: "10 min",
          recursos: "Pelota pequeña"
        }
      ]
    };
  }
}

// 10. Backward-compatibility wrapper for Ciencias Sociales 1ro daily planner
export async function generateSocialesPlan(planData: {
  grado: string;
  unidad: string;
  tema: string;
  subtema: string;
  docente?: string;
  centro_educativo?: string;
}): Promise<any> {
  return generateDailyPlan({
    ...planData,
    asignatura: "Ciencias Sociales"
  });
}

// 11. Daily plan synthesis for Unit planning
export async function synthesizeUnitPlan(
  plans: any[],
  subject: string,
  grade: string,
  curricularContext: {
    tema: string;
    competencias: string;
    competencias_especificas: string;
    centro_educativo: string;
    seccion: string;
  }
): Promise<any> {
  const serializeContentList = (val: any): string => {
    if (val == null) return '';
    if (Array.isArray(val)) return val.map(String).join(', ');
    if (typeof val === 'string') return val;
    return String(val);
  };

  const context = plans
    .map((p: any, index: number) => {
      const data = p.customFields || p.formData || {};
      const momentosArr = Array.isArray(data.momentos) 
        ? data.momentos 
        : [
            { moment: 'Inicio', descripcion: p.momentos?.inicio || '' },
            { moment: 'Desarrollo', descripcion: p.momentos?.desarrollo || '' },
            { moment: 'Cierre', descripcion: p.momentos?.cierre || '' }
          ];

      return `
Plan ${index + 1} (${data.fecha || p.creado_en?.split('T')[0] || 'N/A'}):
- Tema: ${data.secuencia || data.titulo || p.titulo || 'N/A'}
- Intención Pedagógica: ${p.intencion_pedagogica || data.intencion_pedagogica || 'N/A'}
- Momentos (Actividades):
  ${momentosArr.map((m: any) => `- ${m.moment || m.titulo || 'Actividad'}: ${m.descripcion} (${m.tiempo || ''} min)`).join('\n  ')}
- Recursos: ${(p.recursos || []).join(', ') || data.recursos || 'N/A'}
- Evaluación Diaria: ${p.evaluacion || data.evaluacion || 'N/A'}
- Contenidos Conceptuales: ${serializeContentList(p.conceptual || data.conceptual)}
- Contenidos Procedimentales: ${serializeContentList(p.procedural || data.procedural || p.procedimental)}
- Contenidos Actitudinales: ${serializeContentList(p.attitudinal || data.attitudinal || p.actitudinal)}
      `.trim();
    })
    .join('\n\n---\n\n');

  const systemPrompt = `
You are an expert pedagogical assistant for ${grade} grade ${subject} teachers in the Dominican Republic (MINERD).
Your task is to synthesize a set of Daily Plans into a coherent Unit Plan.

### DATA TO USE FOR GENERATION:
Area: ${subject}
Grade: ${grade}
Unit/Theme: ${curricularContext?.tema || 'N/A'}
Competencies: ${curricularContext?.competencias || 'N/A'}
Competencies Specs: ${curricularContext?.competencias_especificas || 'N/A'}
School: ${curricularContext?.centro_educativo || 'N/A'}
Section: ${curricularContext?.seccion || 'N/A'}

### FIELD SPECIFICATIONS:

#### 1. situacion_aprendizaje (The most important field):
Follow these OBLIGATORY RULES:
1. Describe a real, close, or significant context for the student.
2. Integrate conceptual contents without explicitly listing them.
3. Provoke actions coherent with selected competencies.
4. DO NOT describe step-by-step activities.
5. DO NOT mention evaluation instruments or techniques.
6. Must serve as a general framework for all daily plans in the unit.
7. Language must be clear, simple, and grade-appropriate (e.g., 1ro de primaria).
8. Implicitly answer: Why learn this? What is it for? In what context?
9. IMPORTANT: The narrative must explicitly mention the grade as "primer grado de primaria" in the introduction.

Structure Template Example:
"En la [Escuela], primer grado de primaria, sección [X], los estudiantes observan/participan en [Situación]. A partir de esto, explorarán [Contenidos/Acciones] para [Propósito], reconociendo [Aportes/Valor]..."

#### 2. estrategia:
- Infer Teaching Strategies from the daily plans. List 3-5 distinct strategies.

#### 3. actividades (ensenanza, aprendizaje, evaluacion):
- Generalize actions from the daily logs into coherent lists for the unit.

#### 4. tecnicas & evaluacion (instrumentos):
- Infer evaluation methods used across the plans.

RESPONSE FORMAT:
Return ONLY valid JSON.
{
  "situacion_aprendizaje": "string (The narrative paragraph)",
  "estrategia": "string (bullet points)",
  "actividades_ensenanza": "string (bullet points)",
  "actividades_aprendizaje": "string (bullet points)",
  "actividades_evaluacion": "string (bullet points)",
  "tecnicas": "string (bullet points)",
  "evaluacion": "string (bullet points of Instruments)",
  "recursos": "string (comma separated)"
}
  `.trim();

  const userPrompt = `Sintetiza las siguientes ${plans.length} planificaciones diarias en el JSON acordado.\n\n${context}`;

  try {
    return await runAICall(systemPrompt, userPrompt, 0.7);
  } catch (error) {
    console.warn("[AI Service] Fallback a simulación de síntesis local por error:", error);
    // Return mock synthesized plan
    return {
      situacion_aprendizaje: `En la escuela ${curricularContext.centro_educativo || 'El Higuero'}, primer grado de primaria, sección ${curricularContext.seccion || 'A'}, los estudiantes muestran interés por conocer su entorno y ubicarse en el espacio escolar. A partir de esto, explorarán nociones espaciales y puntos de referencia para desarrollar su orientación y reconocer la importancia de saber ubicarse en situaciones cotidianas de su comunidad.`,
      estrategia: `• Estrategia de recuperación de experiencias previas\n• Descubrimiento e indagación dialógica\n• Socialización en base a actividades grupales`,
      actividades_ensenanza: `• El docente guía un recorrido por la escuela identificando puntos cardinales.\n• El docente modela el uso de referentes espaciales (arriba, abajo, izquierda, derecha).\n• El docente orienta dinámicas de ubicación en el aula.`,
      actividades_aprendizaje: `• Los estudiantes dibujan un croquis sencillo de su salón de clases.\n• Los estudiantes participan en el juego del tesoro escondido usando referencias espaciales.\n• Los estudiantes verbalizan la ubicación de diferentes objetos en el aula.`,
      actividades_evaluacion: `• Participación activa en las actividades lúdicas grupales.\n• Elaboración correcta del croquis básico.\n• Identificación oral de referencias de ubicación espacial.`,
      tecnicas: `• Observación directa y sistemática\n• Análisis de producciones de los alumnos`,
      evaluacion: `• Lista de cotejo de nociones espaciales\n• Registro anecdótico del desempeño lúdico`,
      recursos: `Cuaderno, lápices de colores, patio escolar, tiza, tarjetas de orientación`
    };
  }
}

export interface ExamGenerationRequest {
  nivel: string;
  grado: string;
  asignatura: string;
  evaluationType: string;
  numQuestions: number;
  topic: string;
  indicators?: string;
  itemTypeCounts: Record<string, number>;
}

export async function generateExam(request: ExamGenerationRequest): Promise<any> {
  const {
    nivel, grado, asignatura,
    evaluationType, numQuestions, topic, indicators,
    itemTypeCounts
  } = request;

  const itemTypes = Object.keys(itemTypeCounts);
  const contextStr = `Crea un examen profesional para estudiantes de ${grado} de nivel ${nivel} en la asignatura de ${asignatura}. El tipo de evaluación es ${evaluationType}.
El tema central a evaluar es: "${topic}".
${indicators ? `Debes apuntar hacia estos indicadores de logro: "${indicators}"` : ''}
En total el examen debe tener EXACTAMENTE ${numQuestions} preguntas.`;

  const itemDistributions = Object.entries(itemTypeCounts)
    .map(([type, count]) => `- ${count} preguntas de tipo "${type}"`)
    .join('\n');

  const systemPrompt = `Eres un creador de exámenes experto y un docente veterano.`;
  const userPrompt = `
Actúa como un Especialista en Evaluación Educativa del MINERD de República Dominicana.
${contextStr}

Debes conformar el examen estructurando la cantidad EXACTA de preguntas por cada tipo de ítem de la siguiente manera:
${itemDistributions}

RESTRICCIONES IMPORTANTES:
- Todo debe estar en español dominicano estándar educativo.
- Debes incluir de manera OBLIGATORIA la propiedad "respuestaCorrecta" para cada pregunta, sin importar el tipo, ya que se usará para imprimir la Guía Docente. Si es "Tema de Desarrollo", la "respuestaCorrecta" debe ser una rúbrica breve o las palabras clave esperadas.
- Si el tipo es 'Verdadero / Falso', incluye "respuestaCorrecta": "Verdadero" o "Falso".
- Si el tipo es 'Selección Múltiple', además del enunciado, debes incluir un arreglo llamado "opciones" con 4 distracciones breves.
- Si el tipo es 'Relaciona / Empareja', el "enunciado" debe ser solo la instrucción fundamental. Además, debes OBLIGATORIAMENTE incluir un arreglo llamado "pares" que contenga objetos con "columnaA" (los conceptos con Letras, ej. "A. CPU", "B. Memoria RAM") y "columnaB" (las definiciones u opuestos correspondientes numerados desordenados, ej. "1. Memoria temporal", "2. Cerebro del PC"). En la propiedad "respuestaCorrecta" indica la combinación (ej. "A-2, B-1").
- Adáptate al nivel cognitivo de un estudiante de ${grado} de ${nivel}.
- AGRUPA LOS ÍTEMS POR TIPO: Si se seleccionaron varios tipos de ítems, el arreglo JSON DEBE estar ordenado agrupando todas las preguntas de un mismo tipo de forma consecutiva (ej. todas las de 'Selección Múltiple' juntas consecutivamente, luego todas las de 'Verdadero / Falso' juntas, etc.). NO las mezcles aleatoriamente a lo largo del JSON.

Responde ÚNICA Y EXCLUSIVAMENTE con un arreglo JSON lineal de objetos. No uses bloques \`\`\`json ni caracteres adicionales fuera del JSON.

Ejemplo de formato de respuesta:
[
  {
    "id": 1,
    "tipo": "Selección Múltiple",
    "enunciado": "¿Qué es la célula?",
    "opciones": ["Unidad de vida", "Un planeta", "Un órgano", "Una piedra"],
    "respuestaCorrecta": "Unidad de vida"
  },
  {
    "id": 2,
    "tipo": "Verdadero / Falso",
    "enunciado": "La célula vegetal contiene paredes celulares.",
    "respuestaCorrecta": "Verdadero"
  },
  {
    "id": 3,
    "tipo": "Relaciona / Empareja",
    "enunciado": "Relaciona los conceptos de la izquierda con las descripciones de la derecha colocando la letra en el espacio correspondiente:",
    "pares": [
      { "columnaA": "A. Núcleo", "columnaB": "1. Produce energía (ATP)" },
      { "columnaA": "B. Mitocondria", "columnaB": "2. Almacena el ADN" }
    ],
    "respuestaCorrecta": "A-2, B-1"
  },
  {
    "id": 4,
    "tipo": "Producción / Desarrollo",
    "enunciado": "Explica con tus palabras las funciones del núcleo celular.",
    "respuestaCorrecta": "Se espera que el alumno mencione: almacenamiento de ADN, control de actividades celulares."
  }
]
  `.trim();

  try {
    const parsedQuestions = await runAICall(systemPrompt, userPrompt, 0.7, "json");
    if (!parsedQuestions || !Array.isArray(parsedQuestions)) {
      throw new Error("El JSON resultante no es un arreglo de preguntas válido.");
    }
    
    // Normalizar IDs
    return {
      questions: parsedQuestions.map((q: any, idx: number) => ({
        id: idx + 1,
        tipo: q.tipo || itemTypes[0] || 'Mixto',
        enunciado: q.enunciado || 'Pregunta omitida por IA',
        opciones: Array.isArray(q.opciones) ? q.opciones : undefined,
        pares: Array.isArray(q.pares) ? q.pares : undefined,
        respuestaCorrecta: q.respuestaCorrecta || 'Respuesta no generada por el asistente.'
      }))
    };
  } catch (err: any) {
    console.error('Error llamando a la IA para examen:', err);
    throw err;
  }
}

export interface WordSearchGenerationRequest {
  topic?: string;
  customText?: string;
  numWords: number;
  difficulty: string;
}

export async function generateWordSearchWords(request: WordSearchGenerationRequest): Promise<string[]> {
  const { topic, customText, numWords, difficulty } = request;

  const contextPrompt = customText
      ? `Extrae las palabras clave más importantes del siguiente texto para un estudiante.\n\nTexto: "${customText}"`
      : `Genera palabras relevantes sobre el tema: "${topic}".`;

  let difficultyConstraints = '';
  if (difficulty === 'Fácil') {
      difficultyConstraints = 'Las palabras deben ser cortas, comunes y fáciles de entender para niños pequeños. Evita palabras compuestas.';
  } else if (difficulty === 'Medio') {
      difficultyConstraints = 'Las palabras deben ser de longitud y dificultad moderada, adecuadas para estudiantes de primaria.';
  } else if (difficulty === 'Difícil') {
      difficultyConstraints = 'Incluye términos más técnicos, específicos o largos relacionados con el tema, adecuados para estudiantes de secundaria.';
  }

  const systemPrompt = `Eres un asistente experto en crear material educativo interactivo.`;
  const userPrompt = `
Tu tarea es generar exactamente ${numWords} palabras para rellenar un juego escolar de Sopa de Letras.

${contextPrompt}

RESTRICCIONES IMPORTANTES:
- ${difficultyConstraints}
- Todas las palabras DEBEN estar en español.
- SIN espacios, SIN tildes, SIN caracteres especiales, SIN números (letras A-Z exclusivamente).
- Si una palabra lleva tilde (ej: corazón), devuélvela sin tilde (corazon).
- Si alguna palabra tiene un espacio, escoge otra o úsala de corrido solo si es un nombre común (ej: "buenos aires" -> "buenosaires").
- No repitas palabras.
- Responde ÚNICA Y EXCLUSIVAMENTE con un arreglo JSON lineal que contenga las ${numWords} palabras como strings. No incluyas backticks, markdown ni explicaciones.

Ejemplo de respuesta válida:
["PERRO", "GATO", "RATON", "VACA", "CABALLO"]
  `.trim();

  try {
    const wordsList = await runAICall(systemPrompt, userPrompt, 0.7, "json");
    if (!Array.isArray(wordsList)) {
        throw new Error("La respuesta no fue un arreglo válido.");
    }

    const cleanedWords = wordsList
        .map((word: string) => word.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, ''))
        .filter((word: string) => word.length >= 3)
        .slice(0, numWords);

    if (cleanedWords.length < 3) {
        throw new Error("La IA no pudo generar suficientes palabras válidas.");
    }

    return cleanedWords;
  } catch (error: any) {
    console.error('Error generando sopa de letras:', error);
    throw new Error(error.message || 'Error al generar las palabras. Verifica tu conexión e inténtalo de nuevo.');
  }
}

export interface CrosswordGenerationRequest {
  topic?: string;
  customText?: string;
  numWords: number;
  difficulty: string;
}

export async function generateCrosswordItems(request: CrosswordGenerationRequest): Promise<{ word: string; clue: string }[]> {
  const { topic, customText, numWords, difficulty } = request;

  const contextPrompt = customText
      ? `Extrae palabras importantes y elabora pistas basándote EXCLUSIVAMENTE en este texto:\n"${customText}"\n`
      : `El tema generador es: "${topic}"`;

  let difficultyConstraints = '';
  if (difficulty === 'Fácil') {
      difficultyConstraints = 'Pistas muy directas, literales o descripciones obvias.';
  } else if (difficulty === 'Medio') {
      difficultyConstraints = 'Una mezcla equitativa, definiciones estándar de diccionario escolar.';
  } else if (difficulty === 'Difícil') {
      difficultyConstraints = 'Cierta complejidad, metáforas, descripciones que requieran pensar un poco o deducción escolar avanzada.';
  }

  const systemPrompt = `Eres un asistente experto en crear material educativo interactivo.`;
  const userPrompt = `
Actúa como un profesor creador de crucigramas educativos divertidos.
Tu objetivo es extraer del texto base o del tema proporcionado, exactamente ${numWords} palabras clave.

Para cada palabra, debes proveer una "pista" (clue) según este nivel de dificultad: "${difficulty}".
- Dificultad: ${difficultyConstraints}

Reglas ESTRICTAS:
1. Las "palabras" (word) deben ser una sola palabra, preferiblemente sustantivos singulares o adjetivos muy conocidos.
2. NO debe haber espacios en la "word".
3. NO debe haber caracteres especiales (comillas, guiones) ni acentos/tildes en la clave "word". Solo letras del alfabeto de la A a la Z. Por favor devuelve "word" en MAYUSCULAS SIN TILDES (ej: ARBOL, CANCION).
4. Las pistas "clue" deben ser oraciones completas legibles con correcta ortografía y signos de puntuación (ej: "Astro luminoso que nos da calor y energía durante el día.").

${contextPrompt}

DEBES devolver el resultado ÚNICAMENTE en este formato JSON válido, sin ningún otro texto alrededor (sin saltos de línea markdown, solo el arreglo):
[
  { "word": "PALABRA", "clue": "Pista descriptiva de la palabra." },
  { "word": "OTRA", "clue": "Es otra pista relacionada al concepto." }
]
  `.trim();

  try {
    const crosswordItems = await runAICall(systemPrompt, userPrompt, 0.7, "json");
    if (!Array.isArray(crosswordItems)) {
        throw new Error("La respuesta no fue un arreglo válido.");
    }

    const finalItems = crosswordItems.map((item: any) => ({
        word: (item.word || '')
            .toUpperCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove tildes
            .replace(/[^A-Z]/g, ''), // Keep only letters
        clue: item.clue || 'Sin pista generada.'
    })).filter(item => item.word.length >= 2); // Filter out 1 letter trash

    if (finalItems.length === 0) {
        throw new Error("La IA no pudo generar suficientes palabras válidas.");
    }

    return finalItems.slice(0, numWords);
  } catch (error: any) {
    console.error('Error generando crucigrama:', error);
    throw new Error(error.message || 'Error al generar el crucigrama. Verifica tu conexión e inténtalo de nuevo.');
  }
}

export interface JeopardyQuestion {
  points: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface JeopardyCategory {
  name: string;
  questions: JeopardyQuestion[];
}

export interface JeopardyGenerationRequest {
  topic: string;
  difficulty: string;
  numTeams?: number;
}

export async function generateJeopardyBoard(request: JeopardyGenerationRequest): Promise<{ categories: JeopardyCategory[]; teamNames: string[] }> {
  const { topic, difficulty, numTeams = 3 } = request;

  const systemPrompt = `Eres un asistente experto en crear material educativo interactivo y dinámicas de gamificación en el aula.`;
  const userPrompt = `
Actúa como un profesor experto en diseñar trivias escolares competitivas.
Tu objetivo es generar un tablero de Jeopardy basado en el tema: "${topic}" y nivel de dificultad: "${difficulty}".

El tablero debe constar de EXACTAMENTE 4 categorías temáticas distintas relacionadas con el tema principal.
Para cada categoría, debes generar exactamente 5 preguntas con valores de puntos crecientes: 100, 200, 300, 400 y 500.

Para cada pregunta:
- Proporciona el enunciado de la pregunta ("question").
- Proporciona un arreglo de exactamente 4 opciones múltiples ("options").
- Indica la respuesta correcta exacta ("correctAnswer"), que debe coincidir exactamente con una de las 4 opciones.
- Agrega una breve explicación ("explanation") de por qué esa opción es correcta.

También debes sugerir exactamente ${numTeams} nombres de equipos temáticos, divertidos y educativos inspirados en el tema principal ("${topic}") y la dificultad ("${difficulty}").

Reglas de dificultad:
- Fácil: Preguntas directas, obvias y conceptos básicos.
- Medio: Mezcla de conceptos intermedios, aplicación práctica directa.
- Difícil: Preguntas técnicas, análisis conceptual, razonamiento de nivel superior.

DEBES devolver el resultado ÚNICAMENTE en este formato JSON válido, sin textos introductorios ni bloques de código markdown:
{
  "categories": [
    {
      "name": "Nombre de Categoría 1",
      "questions": [
        {
          "points": 100,
          "question": "¿Pregunta de 100 puntos?",
          "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
          "correctAnswer": "Opción A",
          "explanation": "Breve explicación..."
        },
        ... (hasta la pregunta de 500 puntos)
      ]
    },
    ... (total de 4 categorías)
  ],
  "teamNames": [
    "Nombre de Equipo 1",
    ... (total de ${numTeams} nombres de equipos)
  ]
}
  `.trim();

  try {
    const data = await runAICall(systemPrompt, userPrompt, 0.75, "json");
    if (!data || !Array.isArray(data.categories)) {
      throw new Error("La respuesta no contiene categorías válidas.");
    }
    const categories = data.categories;
    const teamNames = Array.isArray(data.teamNames) ? data.teamNames.slice(0, numTeams) : Array.from({ length: numTeams }, (_, i) => `Grupo ${i + 1}`);
    return { categories, teamNames };
  } catch (error: any) {
    console.error('Error generando tablero Jeopardy:', error);
    const categories = getMockJeopardyBoard(topic, difficulty);
    const teamNames = Array.from({ length: numTeams }, (_, i) => `Grupo ${i + 1}`);
    return { categories, teamNames };
  }
}

function getMockJeopardyBoard(topic: string, difficulty: string): JeopardyCategory[] {
  return [
    {
      name: "Conceptos Básicos",
      questions: [
        { points: 100, question: `¿Cuál es el concepto principal al hablar de "${topic}"?`, options: ["Definición Básica", "Idea Equivocada", "Concepto Alterno", "Dato Irrelevante"], correctAnswer: "Definición Básica", explanation: "Representa el cimiento elemental del tema." },
        { points: 200, question: `¿Cuál de las siguientes afirmaciones sobre "${topic}" es correcta?`, options: ["Afirmación Verdadera", "Mito Común", "Error de Concepto", "Dato Desactualizado"], correctAnswer: "Afirmación Verdadera", explanation: "Es un hecho comprobado y aceptado sobre el tema." },
        { points: 300, question: `¿Cuál es un elemento fundamental para el desarrollo de "${topic}"?`, options: ["Elemento Clave", "Accesorio Opcional", "Detalle Menor", "Factor Externo"], correctAnswer: "Elemento Clave", explanation: "Es indispensable para comprender el funcionamiento general." },
        { points: 400, question: `Si analizamos "${topic}" en la vida cotidiana, ¿dónde lo observamos más claramente?`, options: ["Ejemplo Práctico", "Caso Imposible", "Teoría Abstracta", "Contexto Ficticio"], correctAnswer: "Ejemplo Práctico", explanation: "Demuestra la aplicabilidad real del tema." },
        { points: 500, question: `¿Qué importancia tiene el estudio de "${topic}" hoy en día?`, options: ["Fomenta el pensamiento crítico y la comprensión científica", "Es una materia obsoleta sin aplicaciones", "Solo sirve para aprobar exámenes de memoria", "Carece de relevancia en el mundo moderno"], correctAnswer: "Fomenta el pensamiento crítico y la comprensión científica", explanation: "Ayuda a estructurar el entendimiento del entorno." }
      ]
    },
    {
      name: "Aplicaciones",
      questions: [
        { points: 100, question: `¿Cómo se aplica principalmente "${topic}" en el aula?`, options: ["A través de dinámicas interactivas", "Mediante la copia mecánica de textos", "Ignorándolo por completo", "Solo con exámenes sorpresa"], correctAnswer: "A través de dinámicas interactivas", explanation: "Facilita la asimilación activa de contenidos." },
        { points: 205, question: `¿Qué recurso es ideal para ilustrar "${topic}"?`, options: ["Modelos visuales y material concreto", "Lectura repetitiva sin dibujos", "Pizarra en blanco", "Ninguno en absoluto"], correctAnswer: "Modelos visuales y material concreto", explanation: "Brinda un soporte cognitivo al alumno." },
        { points: 300, question: `¿Qué sucede si aplicamos mal los principios de "${topic}"?`, options: ["Se generan lagunas de aprendizaje", "Todo funciona exactamente igual", "El aprendizaje se acelera mágicamente", "Se obtiene una calificación perfecta"], correctAnswer: "Se generan lagunas de aprendizaje", explanation: "El desorden curricular desorienta al estudiante." },
        { points: 400, question: `¿Cuál es un caso de éxito real al usar "${topic}"?`, options: ["Alumnos motivados que explican el tema con sus palabras", "Aulas en silencio temerosas de participar", "Copiar un libro de texto completo", "Memorizar definiciones sin entenderlas"], correctAnswer: "Alumnos motivados que explican el tema con sus palabras", explanation: "Indica un nivel de comprensión autónomo." },
        { points: 500, question: `¿Qué método promueve una mejor retención al aplicar "${topic}"?`, options: ["El aprendizaje basado en proyectos y la gamificación", "La repetición memorística constante", "Ver videos sin realizar actividades", "Estudiar solo la noche anterior del examen"], correctAnswer: "El aprendizaje basado en proyectos y la gamificación", explanation: "Involucra al alumno de manera multisensorial y motivacional." }
      ]
    },
    {
      name: "Desafíos",
      questions: [
        { points: 100, question: `¿Cuál es el obstáculo inicial al estudiar "${topic}"?`, options: ["La falta de interés o conceptos previos erróneos", "Que es demasiado simple", "El exceso de materiales divertidos", "Que no requiere esfuerzo"], correctAnswer: "La falta de interés o conceptos previos erróneos", explanation: "Superar el desinterés inicial es clave." },
        { points: 200, question: `¿Cómo puede un docente superar la resistencia al tema "${topic}"?`, options: ["Relacionándolo con el entorno real del alumno", "Aumentando la cantidad de tareas escritas", "Castigando a quienes no presten atención", "Evitando hablar del tema en clase"], correctAnswer: "Relacionándolo con el entorno real del alumno", explanation: "La relevancia personal despierta la curiosidad." },
        { points: 300, question: `¿Qué error común cometen los estudiantes con "${topic}"?`, options: ["Confundir conceptos similares debido a falta de práctica", "Entenderlo todo a la primera sin dudar", "Investigar de forma autónoma en la biblioteca", "Hacer demasiadas preguntas de calidad"], correctAnswer: "Confundir conceptos similares debido a falta de práctica", explanation: "Se soluciona con retroalimentación oportuna." },
        { points: 400, question: `¿Qué estrategia es ineficaz ante un bloqueo sobre "${topic}"?`, options: ["Explicar de la misma forma una y otra vez", "Utilizar analogías sencillas", "Realizar una pausa activa", "Cambiar de canal sensorial"], correctAnswer: "Explicar de la misma forma una y otra vez", explanation: "Si un método no funciona, repetir la misma explicación no ayuda." },
        { points: 500, question: `¿Cuál es el mayor reto a largo plazo con respecto a "${topic}"?`, options: ["Lograr que el alumno transfiera lo aprendido a situaciones nuevas", "Recordar el concepto para el examen del día siguiente", "Mantener los cuadernos limpios y ordenados", "Aprenderse el glosario de memoria"], correctAnswer: "Lograr que el alumno transfiera lo aprendido a situaciones nuevas", explanation: "La transferencia del aprendizaje es la meta final de la educación." }
      ]
    },
    {
      name: "Curiosidades",
      questions: [
        { points: 100, question: `¿Qué hecho curioso destaca de "${topic}"?`, options: ["Tiene conexiones inesperadas con la vida diaria", "Es un tema aburrido y sin misterios", "Fue descubierto hace solo dos días", "Carece de historia o antecedentes"], correctAnswer: "Tiene conexiones inesperadas con la vida diaria", explanation: "La curiosidad conecta con la memoria afectiva." },
        { points: 200, question: `¿Quiénes fueron los pioneros en estudiar aspectos de "${topic}"?`, options: ["Científicos y filósofos curiosos a lo largo de la historia", "Personajes ficticios de cuentos", "Nadie, surgió de la nada", "Computadoras del futuro"], correctAnswer: "Científicos y filósofos curiosos a lo largo de la historia", explanation: "La ciencia es una construcción colectiva histórica." },
        { points: 300, question: `¿Qué dato sorprendente sobre "${topic}" suele asombrar a los alumnos?`, options: ["Que pequeños cambios pueden producir grandes diferencias", "Que las respuestas son siempre las mismas en todos lados", "Que no se puede usar matemáticas para explicarlo", "Que está prohibido dibujarlo"], correctAnswer: "Que pequeños cambios pueden producir grandes diferencias", explanation: "Despierta el asombro y la indagación científica." },
        { points: 400, question: `¿Cómo influye la tecnología moderna en el avance de "${topic}"?`, options: ["Permite simular, medir y visualizar phenomena complejos en segundos", "Hace que el tema sea completamente inútil", "Reemplaza al cerebro humano por completo", "Impedir que los alumnos piensen por sí mismos"], correctAnswer: "Permite simular, medir y visualizar phenomena complejos en segundos", explanation: "La tecnología amplifica nuestras capacidades cognitivas." },
        { points: 500, question: `Si "${topic}" fuera un superpoder, ¿en qué consistiría principalmente?`, options: ["En la habilidad de comprender y transformar el entorno de forma lógica", "En volar o volverse invisible", "En adivinar las preguntas de los exámenes", "En hacer que las tareas se escriban solas"], correctAnswer: "En la habilidad de comprender y transformar el entorno de forma lógica", explanation: "El verdadero superpoder del saber es la resolución de problemas." }
      ]
    }
  ];
}

export async function generateEphemerisDescription(title: string, month: string): Promise<string> {
  await syncAIConfigWithSupabase();
  const config = loadAIConfig();
  const provider = config.activeProvider;
  const provConf = config.providers[provider];

  const apiKey = (provConf.useCustomServer ? provConf.customApiKey : provConf.apiKey) || (provConf.useCustomServer ? "no-key-needed" : "");
  const baseURL = provConf.useCustomServer ? provConf.customBaseURL : "";
  const model = provConf.defaultModel;

  if (!apiKey) {
    console.warn(`[AI Service] No hay API Key configurada para ${provider}. Usando fallback local.`);
    return `Efeméride conmemorativa sobre ${title} que se celebra en el mes de ${month}.`;
  }

  const systemPrompt = `Eres un experto en historia y cultura, con especial enfoque en efemérides dominicanas e internacionales relevantes para el ámbito educativo.`;
  const userPrompt = `Genera una descripción concisa, educativa y atractiva (máximo 300 caracteres aprox, o 2 frases bien construidas) sobre la efeméride: "${title}" del mes de "${month}".
  
  Requisitos:
  1. Enfócate en el origen o el propósito de la celebración.
  2. Mantén un tono formal pero accesible para docentes y estudiantes.
  3. Si la efeméride es específica de República Dominicana, resalta su importancia nacional.
  
  Responde DIRECTAMENTE con el texto de la descripción, sin preámbulos ni comillas.`;

  try {
    let result = "";
    if (provider === "openai") {
      result = await callOpenAI(apiKey, baseURL, model, systemPrompt, userPrompt);
    } else if (provider === "gemini") {
      result = await callGemini(apiKey, baseURL, model, systemPrompt, userPrompt);
    } else if (provider === "groq") {
      result = await callGroq(apiKey, baseURL, model, systemPrompt, userPrompt);
    } else if (provider === "deepseek") {
      result = await callDeepSeek(apiKey, baseURL, model, systemPrompt, userPrompt);
    }
    
    const cleaned = result.replace(/```[a-z]*\n?|```/gi, "").trim();
    return cleaned;
  } catch (error) {
    console.error("[AI Service] Error generating description:", error);
    return `Efeméride conmemorativa sobre ${title} que se celebra en el mes de ${month}.`;
  }
}



