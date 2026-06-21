import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Users, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  FileText, 
  Layout, 
  Clock, 
  Activity,
  Heart,
  HelpCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Check,
  Palette,
  Calendar,
  Package,
  School,
  PenTool,
  Languages,
  Lightbulb,
  Target,
  FlaskConical,
  Library,
  BookMarked,
  Brain,
  Atom,
  Scroll,
  Shapes,
  Globe,
  Compass,
  Notebook,
  Calculator,
  Music,
  Layers,
  Loader2
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useRequireAuth } from '../lib/useRequireAuth';
import { saveLessonPlan as storageSaveLessonPlan, LessonPlan, uid } from '../lib/storage';
import { EDUCATION_STRUCTURE, getAllLevels, getCyclesByLevel, getCycleById, getGradesByCycle, getGradeById } from '../lib/data/educationStructure';
import { OFFICIAL_DEFAULT_SUBJECTS } from '../lib/data/defaultSubjects';
import { getCompetenciesBySubject } from '../lib/data/scienceCurriculum';
import { getUnitsBySubjectAndGrade, Unit } from '../lib/data/unitCurriculum';
import LenguaEspañola from '../components/forms/Primaria/Primer Grado/Lengua Española/LenguaEspañola';
import Matematica from '../components/forms/Primaria/Primer Grado/Matematica/Matematica';
import LenguaEspañola2do from '../components/forms/Primaria/Segundo Grado/Lengua Española/LenguaEspañola';
import Matematica2do from '../components/forms/Primaria/Segundo Grado/Matematica/Matematica';
import LenguaEspañola3ro from '../components/forms/Primaria/Terccer Grado/Lengua Española/LenguaEspañola';
import LenguaEspañola4to from '../components/forms/Primaria/Cuarto Grado/Lengua Española/LenguaEspañola';
import LenguaEspañola5to from '../components/forms/Primaria/Quinto Grado/Lengua Española/LenguaEspañola';
import LenguaEspañola6to from '../components/forms/Primaria/Sexto Grado/Lengua Española/LenguaEspañola';
import Matematica3ro from '../components/forms/Primaria/Terccer Grado/Matematica/Matematica';
import Matematica4to from '../components/forms/Primaria/Cuarto Grado/Matematica/Matematica';
import Matematica5to from '../components/forms/Primaria/Quinto Grado/Matematica/Matematica';
import Matematica6to from '../components/forms/Primaria/Sexto Grado/Matematica/Matematica';
import CienciasSocialesDiaria from '../components/forms/Primaria/Primer Grado/Ciencias Sociales/CienciasSocialesDiaria';
import CienciasSocialesUnidad from '../components/forms/Primaria/Primer Grado/Ciencias Sociales/CienciasSocialesUnidad';
import CienciasNaturalesDiaria from '../components/forms/Primaria/Primer Grado/Ciencias Naturales/CienciasNaturalesDiaria';
import CienciasNaturalesUnidad from '../components/forms/Primaria/Primer Grado/Ciencias Naturales/CienciasNaturalesUnidad';
import CienciasSocialesDiaria2do from '../components/forms/Primaria/Segundo Grado/Ciencias Sociales/CienciasSocialesDiaria';
import CienciasSocialesUnidad2do from '../components/forms/Primaria/Segundo Grado/Ciencias Sociales/CienciasSocialesUnidad';
import CienciasNaturalesDiaria2do from '../components/forms/Primaria/Segundo Grado/Ciencias Naturales/CienciasNaturalesDiaria';
import CienciasNaturalesUnidad2do from '../components/forms/Primaria/Segundo Grado/Ciencias Naturales/CienciasNaturalesUnidad';
import EducacionArtisticaDiaria from '../components/forms/Primaria/Primer Grado/Educación Artistica/EducacionArtisticaDiaria';
import EducacionArtisticaUnidad from '../components/forms/Primaria/Primer Grado/Educación Artistica/EducacionArtisticaUnidad';
import EducacionArtisticaDiaria2do from '../components/forms/Primaria/Segundo Grado/Educación Artistica/EducacionArtisticaDiaria';
import EducacionArtisticaUnidad2do from '../components/forms/Primaria/Segundo Grado/Educación Artistica/EducacionArtisticaUnidad';
import FormacionHumanaDiaria from '../components/forms/Primaria/Primer Grado/Formacion Humana/FormacionHumanaDiaria';
import FormacionHumanaUnidad from '../components/forms/Primaria/Primer Grado/Formacion Humana/FormacionHumanaUnidad';
import FormacionHumanaDiaria2do from '../components/forms/Primaria/Segundo Grado/Formacion Humana/FormacionHumanaDiaria';
import FormacionHumanaUnidad2do from '../components/forms/Primaria/Segundo Grado/Formacion Humana/FormacionHumanaUnidad';
import EducacionFisicaDiaria from '../components/forms/Primaria/Primer Grado/Educacion Fisica/EducacionFisicaDiaria';
import EducacionFisicaUnidad from '../components/forms/Primaria/Primer Grado/Educacion Fisica/EducacionFisicaUnidad';
import EducacionFisicaDiaria2do from '../components/forms/Primaria/Segundo Grado/Educacion Fisica/EducacionFisicaDiaria';
import EducacionFisicaUnidad2do from '../components/forms/Primaria/Segundo Grado/Educacion Fisica/EducacionFisicaUnidad';
import compiled2ndCycleSequences from '../lib/data/sequences/primaria/compiled_2nd_cycle_sequences.json';

import CienciasSocialesDiaria4to from '../components/forms/Primaria/Cuarto Grado/Ciencias Sociales/CienciasSocialesDiaria';
import CienciasSocialesUnidad4to from '../components/forms/Primaria/Cuarto Grado/Ciencias Sociales/CienciasSocialesUnidad';
import CienciasNaturalesDiaria4to from '../components/forms/Primaria/Cuarto Grado/Ciencias Naturales/CienciasNaturalesDiaria';
import CienciasNaturalesUnidad4to from '../components/forms/Primaria/Cuarto Grado/Ciencias Naturales/CienciasNaturalesUnidad';
import EducacionArtisticaDiaria4to from '../components/forms/Primaria/Cuarto Grado/Educación Artistica/EducacionArtisticaDiaria';
import EducacionArtisticaUnidad4to from '../components/forms/Primaria/Cuarto Grado/Educación Artistica/EducacionArtisticaUnidad';
import FormacionHumanaDiaria4to from '../components/forms/Primaria/Cuarto Grado/Formacion Humana/FormacionHumanaDiaria';
import FormacionHumanaUnidad4to from '../components/forms/Primaria/Cuarto Grado/Formacion Humana/FormacionHumanaUnidad';
import EducacionFisicaDiaria4to from '../components/forms/Primaria/Cuarto Grado/Educacion Fisica/EducacionFisicaDiaria';
import EducacionFisicaUnidad4to from '../components/forms/Primaria/Cuarto Grado/Educacion Fisica/EducacionFisicaUnidad';

// 5to Grado Forms
import CienciasSocialesDiaria5to from '../components/forms/Primaria/Quinto Grado/Ciencias Sociales/CienciasSocialesDiaria';
import CienciasSocialesUnidad5to from '../components/forms/Primaria/Quinto Grado/Ciencias Sociales/CienciasSocialesUnidad';
import CienciasNaturalesDiaria5to from '../components/forms/Primaria/Quinto Grado/Ciencias Naturales/CienciasNaturalesDiaria';
import CienciasNaturalesUnidad5to from '../components/forms/Primaria/Quinto Grado/Ciencias Naturales/CienciasNaturalesUnidad';
import EducacionArtisticaDiaria5to from '../components/forms/Primaria/Quinto Grado/Educación Artistica/EducacionArtisticaDiaria';
import EducacionArtisticaUnidad5to from '../components/forms/Primaria/Quinto Grado/Educación Artistica/EducacionArtisticaUnidad';
import FormacionHumanaDiaria5to from '../components/forms/Primaria/Quinto Grado/Formacion Humana/FormacionHumanaDiaria';
import FormacionHumanaUnidad5to from '../components/forms/Primaria/Quinto Grado/Formacion Humana/FormacionHumanaUnidad';
import EducacionFisicaDiaria5to from '../components/forms/Primaria/Quinto Grado/Educacion Fisica/EducacionFisicaDiaria';
import EducacionFisicaUnidad5to from '../components/forms/Primaria/Quinto Grado/Educacion Fisica/EducacionFisicaUnidad';

// 6to Grado Forms
import CienciasSocialesDiaria6to from '../components/forms/Primaria/Sexto Grado/Ciencias Sociales/CienciasSocialesDiaria';
import CienciasSocialesUnidad6to from '../components/forms/Primaria/Sexto Grado/Ciencias Sociales/CienciasSocialesUnidad';
import CienciasNaturalesDiaria6to from '../components/forms/Primaria/Sexto Grado/Ciencias Naturales/CienciasNaturalesDiaria';
import CienciasNaturalesUnidad6to from '../components/forms/Primaria/Sexto Grado/Ciencias Naturales/CienciasNaturalesUnidad';
import EducacionArtisticaDiaria6to from '../components/forms/Primaria/Sexto Grado/Educación Artistica/EducacionArtisticaDiaria';
import EducacionArtisticaUnidad6to from '../components/forms/Primaria/Sexto Grado/Educación Artistica/EducacionArtisticaUnidad';
import FormacionHumanaDiaria6to from '../components/forms/Primaria/Sexto Grado/Formacion Humana/FormacionHumanaDiaria';
import FormacionHumanaUnidad6to from '../components/forms/Primaria/Sexto Grado/Formacion Humana/FormacionHumanaUnidad';
import EducacionFisicaDiaria6to from '../components/forms/Primaria/Sexto Grado/Educacion Fisica/EducacionFisicaDiaria';
import EducacionFisicaUnidad6to from '../components/forms/Primaria/Sexto Grado/Educacion Fisica/EducacionFisicaUnidad';
// 3er Grado Forms
import CienciasSocialesDiaria3ro from '../components/forms/Primaria/Terccer Grado/Ciencias Sociales/CienciasSocialesDiaria';
import CienciasSocialesUnidad3ro from '../components/forms/Primaria/Terccer Grado/Ciencias Sociales/CienciasSocialesUnidad';
import CienciasNaturalesDiaria3ro from '../components/forms/Primaria/Terccer Grado/Ciencias Naturales/CienciasNaturalesDiaria';
import CienciasNaturalesUnidad3ro from '../components/forms/Primaria/Terccer Grado/Ciencias Naturales/CienciasNaturalesUnidad';
import EducacionArtisticaDiaria3ro from '../components/forms/Primaria/Terccer Grado/Educación Artistica/EducacionArtisticaDiaria';
import EducacionArtisticaUnidad3ro from '../components/forms/Primaria/Terccer Grado/Educación Artistica/EducacionArtisticaUnidad';
import FormacionHumanaDiaria3ro from '../components/forms/Primaria/Terccer Grado/Formacion Humana/FormacionHumanaDiaria';
import FormacionHumanaUnidad3ro from '../components/forms/Primaria/Terccer Grado/Formacion Humana/FormacionHumanaUnidad';
import EducacionFisicaDiaria3ro from '../components/forms/Primaria/Terccer Grado/Educacion Fisica/EducacionFisicaDiaria';
import EducacionFisicaUnidad3ro from '../components/forms/Primaria/Terccer Grado/Educacion Fisica/EducacionFisicaUnidad';
import { consumeCredits, hasEnoughCredits, getUserCredits } from '../lib/credits';
import ModalCreditos from '../components/ai/ModalCreditos';
import { generateToolContent } from '../lib/services/aiService';

const SUBJECT_MOTTOS: Record<string, string> = {
  'lengua-espanola': 'Comunicación y comprensión escrita',
  'matematica': 'Razonamiento lógico y numérico',
  'ciencias-sociales': 'Sociedad, geografía e historia',
  'ciencias-naturaleza': 'Indagación y método científico',
  'educacion-artistica': 'Creatividad y expresión estética',
  'educacion-fisica': 'Motricidad y hábitos saludables',
  'formacion-humana': 'Valores, ética y espiritualidad',
  'lengua-extranjera-ingles': 'Comunicación en inglés',
  'lengua-extranjera-frances': 'Comunicación en francés'
};

const toSentenceCase = (str: string): string => {
  if (!str) return str;
  const lower = str.toLowerCase();
  const match = lower.match(/[a-záéíóúüñ]/i);
  if (match && match.index !== undefined) {
    const idx = match.index;
    return lower.slice(0, idx) + lower[idx].toUpperCase() + lower.slice(idx + 1);
  }
  return str.charAt(0).toUpperCase() + lower.slice(1);
};

const normalizeGradeId = (grade: string, level?: string): string => {
  if (!grade) return '';
  if (grade.startsWith('primaria-') || grade.startsWith('secundaria-') || grade.startsWith('inicial-')) {
    return grade;
  }
  const cleanGrade = grade.toLowerCase().trim();
  const cleanLevel = level?.toUpperCase().trim() || '';

  if (cleanLevel === 'SECUNDARIA' || cleanGrade.includes('sec')) {
    if (cleanGrade.includes('1')) return 'secundaria-1ro';
    if (cleanGrade.includes('2')) return 'secundaria-2do';
    if (cleanGrade.includes('3')) return 'secundaria-3ro';
    if (cleanGrade.includes('4')) return 'secundaria-4to';
    if (cleanGrade.includes('5')) return 'secundaria-5to';
    if (cleanGrade.includes('6')) return 'secundaria-6to';
  }

  if (cleanLevel === 'PRIMARIA' || !cleanLevel) {
    if (cleanGrade === '1ro') return 'primaria-1ro';
    if (cleanGrade === '2do') return 'primaria-2do';
    if (cleanGrade === '3ro') return 'primaria-3ro';
    if (cleanGrade === '4to') return 'primaria-4to';
    if (cleanGrade === '5to') return 'primaria-5to';
    if (cleanGrade === '6to') return 'primaria-6to';
  }

  if (cleanLevel === 'INICIAL') {
    if (cleanGrade.includes('maternal')) return 'inicial-maternal';
    if (cleanGrade.includes('infantes')) return 'inicial-infantes';
    if (cleanGrade.includes('parvulos') || cleanGrade.includes('párvulos')) return 'inicial-parvulos';
    if (cleanGrade.includes('prekinder') || cleanGrade.includes('pre-kinder')) return 'inicial-prekinder';
    if (cleanGrade.includes('kinder') || cleanGrade.includes('kínder')) return 'inicial-kinder';
    if (cleanGrade.includes('preprimario') || cleanGrade.includes('pre-primario')) return 'inicial-preprimario';
  }

  return grade;
};


import seqLengua1_1ro from '../lib/data/sequences/primaria/1ro/lengua/seq-1-lengua-1ro.json';
import seqLengua2_1ro from '../lib/data/sequences/primaria/1ro/lengua/seq-2-lengua-1ro.json';
import seqLengua3_1ro from '../lib/data/sequences/primaria/1ro/lengua/seq-3-lengua-1ro.json';
import seqLengua4_1ro from '../lib/data/sequences/primaria/1ro/lengua/seq-4-lengua-1ro.json';
import seqLengua5_1ro from '../lib/data/sequences/primaria/1ro/lengua/seq-5-lengua-1ro.json';
import seqLengua6_1ro from '../lib/data/sequences/primaria/1ro/lengua/seq-6-lengua-1ro.json';

const LENGUA_1RO_SEQUENCES = [
  seqLengua1_1ro,
  seqLengua2_1ro,
  seqLengua3_1ro,
  seqLengua4_1ro,
  seqLengua5_1ro,
  seqLengua6_1ro
] as any[];

import seqMatematica1_1ro from '../lib/data/sequences/primaria/1ro/matematica/seq-1-matematica-1ro.json';
import seqMatematica2_1ro from '../lib/data/sequences/primaria/1ro/matematica/seq-2-matematica-1ro.json';
import seqMatematica3_1ro from '../lib/data/sequences/primaria/1ro/matematica/seq-3-matematica-1ro.json';
import seqMatematica4_1ro from '../lib/data/sequences/primaria/1ro/matematica/seq-4-matematica-1ro.json';
import seqMatematica5_1ro from '../lib/data/sequences/primaria/1ro/matematica/seq-5-matematica-1ro.json';
import seqMatematica6_1ro from '../lib/data/sequences/primaria/1ro/matematica/seq-6-matematica-1ro.json';

const MATEMATICA_1RO_DESCRIPTIONS = [
  "Conteo y reconocimiento de cantidades en colecciones de objetos.",
  "Uso de los números para resolver situaciones sencillas de la vida cotidiana.",
  "Comparación de cantidades y uso de números en contextos lúdicos.",
  "Resolución de sumas y restas simples mediante juegos y actividades prácticas.",
  "Uso de los números para ordenar, contar y reconocer el paso del tiempo.",
  "Conteo, comparación y resolución de problemas con alimentos y situaciones cercanas."
];

const MATEMATICA_1RO_SEQUENCES = [
  seqMatematica1_1ro,
  seqMatematica2_1ro,
  seqMatematica3_1ro,
  seqMatematica4_1ro,
  seqMatematica5_1ro,
  seqMatematica6_1ro
].map((seq: any, idx: number) => {
  return {
    ...seq,
    id: seq.sequenceId || `seq-${idx+1}-matematica-1ro`,
    title: toSentenceCase(seq.title || seq.sequenceTitle || `Secuencia ${idx+1}`),
    description: MATEMATICA_1RO_DESCRIPTIONS[idx],
    order: seq.order !== undefined ? seq.order : idx + 1,
    durationWeeks: seq.durationWeeks !== undefined ? seq.durationWeeks : 4,
    blocks: (seq.blocks || []).map((blk: any, bIdx: number) => ({
      ...blk,
      id: blk.id || `blk-seq-${idx+1}-matematica-${bIdx+1}`,
      title: blk.title || blk.blockTitle || `Bloque ${bIdx+1}`,
      activities: (blk.activities || []).map((act: any, aIdx: number) => ({
        ...act,
        id: act.id || `act-seq-${idx+1}-matematica-${bIdx+1}-${aIdx+1}`,
        title: act.title || act.activityTitle || `Actividad ${aIdx+1}`
      }))
    }))
  };
}) as any[];

// 2do Grado Sequences
import seqLengua1_2do from '../lib/data/sequences/primaria/2do/lengua/seq-1.json';
import seqLengua2_2do from '../lib/data/sequences/primaria/2do/lengua/seq-2.json';
import seqLengua3_2do from '../lib/data/sequences/primaria/2do/lengua/seq-3.json';
import seqLengua4_2do from '../lib/data/sequences/primaria/2do/lengua/seq-4.json';
import seqLengua5_2do from '../lib/data/sequences/primaria/2do/lengua/seq-5.json';
import seqLengua6_2do from '../lib/data/sequences/primaria/2do/lengua/seq-6.json';

const LENGUA_2DO_DESCRIPTIONS = [
  "Secuencia centrada en el reconocimiento del nombre propio y documentos de identidad.",
  "Comprensión y producción de etiquetas para identificar productos de uso cotidiano.",
  "Exploración de la estructura y función de las recetas de cocina sencillas.",
  "Lectura y comprensión de noticias locales sencillas e identificación de su estructura.",
  "Lectura y análisis de cuentos infantiles sencillos para fomentar la imaginación.",
  "Comprensión y redacción de instructivos sencillos para realizar tareas cotidianas."
];

const LENGUA_2DO_SEQUENCES = [
  seqLengua1_2do,
  seqLengua2_2do,
  seqLengua3_2do,
  seqLengua4_2do,
  seqLengua5_2do,
  seqLengua6_2do
].map((seq: any, idx: number) => {
  return {
    ...seq,
    id: seq.sequenceId || `seq-${idx+1}-lengua-2do`,
    title: seq.sequenceTitle || `Secuencia ${idx+1}`,
    description: LENGUA_2DO_DESCRIPTIONS[idx],
    order: seq.order !== undefined ? seq.order : idx + 1,
    durationWeeks: seq.durationWeeks !== undefined ? seq.durationWeeks : 4,
    blocks: (seq.blocks || []).map((blk: any, bIdx: number) => ({
      ...blk,
      id: blk.id || `blk-seq-${idx+1}-lengua-2do-${bIdx+1}`,
      title: blk.title || blk.blockTitle || `Bloque ${bIdx+1}`,
      activities: (blk.activities || []).map((act: any, aIdx: number) => ({
        ...act,
        id: act.id || `act-seq-${idx+1}-lengua-2do-${bIdx+1}-${aIdx+1}`,
        title: act.title || act.activityTitle || `Actividad ${aIdx+1}`
      }))
    }))
  };
}) as any[];

import seqMatematica1_2do from '../lib/data/sequences/primaria/2do/matematica/seq-1.json';
import seqMatematica2_2do from '../lib/data/sequences/primaria/2do/matematica/seq-2.json';
import seqMatematica3_2do from '../lib/data/sequences/primaria/2do/matematica/seq-3.json';
import seqMatematica4_2do from '../lib/data/sequences/primaria/2do/matematica/seq-4.json';
import seqMatematica5_2do from '../lib/data/sequences/primaria/2do/matematica/seq-5.json';
import seqMatematica6_2do from '../lib/data/sequences/primaria/2do/matematica/seq-6.json';

const MATEMATICA_2DO_DESCRIPTIONS = [
  "Secuencia sobre sistema de numeración, conteo y resolución de problemas.",
  "Secuencia sobre operaciones (suma y resta) en contexto de juegos.",
  "Resolución de problemas de compra y venta, uso de números más grandes.",
  "Reconocimiento y descripción de cuerpos geométricos y figuras planas.",
  "Uso del calendario, días de la semana y medidas de tiempo.",
  "Recolección y organización de datos en tablas sencillas."
];

const MATEMATICA_2DO_TITLES = [
  "Un día en la playa",
  "Juegos y problemas",
  "Números más grandes",
  "Problemas y cálculos",
  "Preparamos juegos",
  "Los deportes"
];

const MATEMATICA_2DO_SEQUENCES = [
  seqMatematica1_2do,
  seqMatematica2_2do,
  seqMatematica3_2do,
  seqMatematica4_2do,
  seqMatematica5_2do,
  seqMatematica6_2do
].map((seq: any, idx: number) => {
  return {
    ...seq,
    id: seq.sequenceId || `seq-${idx+1}-matematica-2do`,
    title: MATEMATICA_2DO_TITLES[idx],
    description: MATEMATICA_2DO_DESCRIPTIONS[idx],
    order: seq.order !== undefined ? seq.order : idx + 1,
    durationWeeks: seq.durationWeeks !== undefined ? seq.durationWeeks : 4,
    blocks: (seq.blocks || []).map((blk: any, bIdx: number) => ({
      ...blk,
      id: blk.id || `blk-seq-${idx+1}-matematica-${bIdx+1}`,
      title: blk.title || blk.blockTitle || `Bloque ${bIdx+1}`,
      activities: (blk.activities || []).map((act: any, aIdx: number) => ({
        ...act,
        id: act.id || `act-seq-${idx+1}-matematica-${bIdx+1}-${aIdx+1}`,
        title: act.title || act.activityTitle || `Actividad ${aIdx+1}`
      }))
    }))
  };
}) as any[];

// 3er Grado Sequences
import seqLengua1_3ro from '../lib/data/sequences/primaria/3ro/lengua/seq-1-autobiografia-3ro.json';
import seqLengua2_3ro from '../lib/data/sequences/primaria/3ro/lengua/seq-2-instructivo-3ro.json';
import seqLengua3_3ro from '../lib/data/sequences/primaria/3ro/lengua/seq-3-noticia-3ro.json';
import seqLengua4_3ro from '../lib/data/sequences/primaria/3ro/lengua/seq-4-cuento-3ro.json';
import seqLengua5_3ro from '../lib/data/sequences/primaria/3ro/lengua/seq-5-articulo-expositivo-3ro.json';
import seqLengua6_3ro from '../lib/data/sequences/primaria/3ro/lengua/seq-6-adivinanza-3ro.json';

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
  return {
    ...seq,
    id: seq.sequenceId || `seq-${idx+1}-lengua-3ro`,
    title: seq.sequenceTitle || `Secuencia ${idx+1}`,
    description: LENGUA_3RO_DESCRIPTIONS[idx],
    order: seq.order !== undefined ? seq.order : idx + 1,
    durationWeeks: seq.durationWeeks !== undefined ? seq.durationWeeks : 4,
    blocks: (seq.blocks || []).map((blk: any, bIdx: number) => ({
      ...blk,
      id: blk.id || `blk-seq-${idx+1}-lengua-3ro-${bIdx+1}`,
      title: blk.title || blk.blockTitle || `Bloque ${bIdx+1}`,
      activities: (blk.activities || []).map((act: any, aIdx: number) => ({
        ...act,
        id: act.id || `act-seq-${idx+1}-lengua-3ro-${bIdx+1}-${aIdx+1}`,
        title: act.title || act.activityTitle || `Actividad ${aIdx+1}`
      }))
    }))
  };
}) as any[];

import seqMatematica1_3ro from '../lib/data/sequences/primaria/3ro/matematica/seq-1.json';
import seqMatematica2_3ro from '../lib/data/sequences/primaria/3ro/matematica/seq-2.json';
import seqMatematica3_3ro from '../lib/data/sequences/primaria/3ro/matematica/seq-3-matematica-3ro.json';
import seqMatematica4_3ro from '../lib/data/sequences/primaria/3ro/matematica/seq-4-matematica-3ro.json';
import seqMatematica5_3ro from '../lib/data/sequences/primaria/3ro/matematica/seq-5-matematica-3ro.json';
import seqMatematica6_3ro from '../lib/data/sequences/primaria/3ro/matematica/seq-6-matematica-3ro.json';

const MATEMATICA_3RO_DESCRIPTIONS = [
  "Actividades de inicio de tercer grado para repasar conceptos básicos y afianzar el conteo.",
  "Resolución de problemas matemáticos en el contexto de visitas y juegos en un parque de diversiones.",
  "Uso del cálculo y la organización de datos aplicados al planeamiento de festejos de cumpleaños.",
  "Exploración de juegos de azar, estrategias de conteo y razonamiento lógico mediante dinámicas lúdicas.",
  "Análisis de datos, conteo y resolución de problemas inspirados en el cuidado de mascotas.",
  "Cálculos aditivos y multiplicativos con números grandes en situaciones de viajes y paseos."
];

const MATEMATICA_3RO_SEQUENCES = [
  seqMatematica1_3ro,
  seqMatematica2_3ro,
  seqMatematica3_3ro,
  seqMatematica4_3ro,
  seqMatematica5_3ro,
  seqMatematica6_3ro
].map((seq: any, idx: number) => {
  return {
    ...seq,
    id: seq.sequenceId || `seq-${idx+1}-matematica-3ro`,
    title: toSentenceCase(seq.title || seq.sequenceTitle || `Secuencia ${idx+1}`),
    description: MATEMATICA_3RO_DESCRIPTIONS[idx],
    order: seq.order !== undefined ? seq.order : idx + 1,
    durationWeeks: seq.durationWeeks !== undefined ? seq.durationWeeks : 4,
    blocks: (seq.blocks || []).map((blk: any, bIdx: number) => ({
      ...blk,
      id: blk.id || `blk-seq-${idx+1}-matematica-${bIdx+1}`,
      title: blk.title || blk.blockTitle || `Bloque ${bIdx+1}`,
      activities: (blk.activities || []).map((act: any, aIdx: number) => ({
        ...act,
        id: act.id || `act-seq-${idx+1}-matematica-${bIdx+1}-${aIdx+1}`,
        title: act.title || act.activityTitle || `Actividad ${aIdx+1}`
      }))
    }))
  };
}) as any[];

const convertMomentsToEditorMoments = (momentsList: any[]) => {
  if (!momentsList || momentsList.length === 0) {
    return {
      inicio: 'Inicio de la clase con dinámica de presentación...',
      desarrollo: 'Desarrollo de las actividades prácticas...',
      cierre: 'Cierre del día mediante preguntas metacognitivas...'
    };
  }
  
  if (momentsList.length === 1) {
    return {
      inicio: `[Inicio] ${momentsList[0].titulo}\n${momentsList[0].description}`,
      desarrollo: 'Desarrollo de las actividades prácticas...',
      cierre: 'Cierre del día mediante preguntas metacognitivas...'
    };
  }
  
  if (momentsList.length === 2) {
    return {
      inicio: `[Inicio] ${momentsList[0].titulo}\n${momentsList[0].description}`,
      desarrollo: `[Desarrollo] ${momentsList[1].titulo}\n${momentsList[1].description}`,
      cierre: 'Cierre del día mediante preguntas metacognitivas...'
    };
  }
  
  if (momentsList.length === 3) {
    return {
      inicio: `[Inicio] ${momentsList[0].titulo}\n${momentsList[0].description}`,
      desarrollo: `[Desarrollo] ${momentsList[1].titulo}\n${momentsList[1].description}`,
      cierre: `[Cierre] ${momentsList[2].titulo}\n${momentsList[2].description}`
    };
  }
  
  const inicioParts = momentsList.slice(0, 1).map(m => `**${m.titulo}**\n${m.description}`);
  const desarrolloParts = momentsList.slice(1, momentsList.length - 1).map(m => `**${m.titulo}**\n${m.description}`);
  const cierreParts = momentsList.slice(momentsList.length - 1).map(m => `**${m.titulo}**\n${m.description}`);
  
  return {
    inicio: inicioParts.join('\n\n'),
    desarrollo: desarrolloParts.join('\n\n'),
    cierre: cierreParts.join('\n\n')
  };
};

const parseResourcesString = (resourcesStr: string): string[] => {
  if (!resourcesStr) return ['Pizarra', 'Cuaderno del alumno'];
  return resourcesStr.split(/[.,;\n]/)
    .map(r => r.trim())
    .filter(r => r.length > 0);
};

// Mock sequences database
const MOCK_SEQUENCES: Record<string, { id: string; title: string; intent: string; conceptual: string; procedimental: string; actitudinal: string; evaluation: string }[]> = {
  'lengua-espanola': [
    { 
      id: 'seq-leng-1', 
      title: 'Secuencia 1: La conversación y el diálogo cotidiano', 
      intent: 'Que los estudiantes logren participar en conversaciones sencillas respetando los turnos de habla y usando fórmulas de cortesía.',
      conceptual: 'La conversación: turnos de habla, fórmulas de saludo y despedida.',
      procedimental: 'Participación en diálogos simulados sobre temas familiares.',
      actitudinal: 'Respeto por la opinión ajena y turnos al hablar.',
      evaluation: 'Muestra interés al escuchar e interviene respetuosamente en la conversación.'
    },
    { 
      id: 'seq-leng-2', 
      title: 'Secuencia 2: El letrero y la identificación', 
      intent: 'Que los estudiantes logren identificar la función comunicativa de los letreros en su entorno escolar.',
      conceptual: 'El letrero: función social, estructura e imágenes.',
      procedimental: 'Identificación de letreros en el colegio y dibujo de uno para el aula.',
      actitudinal: 'Valoración del letrero como medio para organizar el espacio social.',
      evaluation: 'Lee e interpreta letreros sencillos colocados en su entorno escolar.'
    },
    { 
      id: 'seq-leng-3', 
      title: 'Secuencia 3: La receta y su estructura', 
      intent: 'Que los estudiantes logren reconocer las partes de una receta de cocina sencilla y sigan instrucciones secuenciales.',
      conceptual: 'La receta: título, ingredientes y preparación.',
      procedimental: 'Ordenamiento secuencial de pasos para preparar una ensalada de frutas.',
      actitudinal: 'Aprecio por la higiene en la preparación de alimentos.',
      evaluation: 'Sigue instrucciones escritas en una receta para lograr un resultado.'
    }
  ],
  'matematica': [
    { 
      id: 'seq-mat-1', 
      title: 'Secuencia 1: Numeración y valor posicional (hasta 999)', 
      intent: 'Que los estudiantes logren leer, escribir y descomponer números de hasta tres cifras según su valor de posición.',
      conceptual: 'El número natural: lectura, escritura y valor de posición (U, D, C).',
      procedimental: 'Representación de cantidades usando el ábaco y bloques multibase.',
      actitudinal: 'Curiosidad y rigor en la realización de conteos numéricos.',
      evaluation: 'Representa y descompone cantidades en unidades, decenas y centenas.'
    },
    { 
      id: 'seq-mat-2', 
      title: 'Secuencia 2: Suma y resta de números naturales', 
      intent: 'Que los estudiantes logren resolver problemas aditivos sencillos del entorno aplicando algoritmos y estrategias de cálculo mental.',
      conceptual: 'La adición y sustracción como operaciones inversas.',
      procedimental: 'Resolución de problemas cotidianos de compra y venta usando sumas y restas.',
      actitudinal: 'Perseverancia e iniciativa frente a la resolución de problemas.',
      evaluation: 'Resuelve problemas cotidianos aplicando operaciones matemáticas básicas.'
    },
    { 
      id: 'seq-mat-3', 
      title: 'Secuencia 3: Figuras y cuerpos geométricos', 
      intent: 'Que los estudiantes logren clasificar polígonos por su número de lados e identifiquen prismas y pirámides en objetos del entorno.',
      conceptual: 'Polígonos: triángulo, cuadrado, rectángulo. Cuerpos: cubo, cilindro, esfera.',
      procedimental: 'Clasificación y construcción de figuras con palillos y masilla.',
      actitudinal: 'Valoración de la geometría presente en el diseño y la naturaleza.',
      evaluation: 'Identifica y describe figuras planas y cuerpos geométricos tridimensionales.'
    }
  ],
  'naturales': [
    { 
      id: 'seq-nat-1', 
      title: 'Ciencias de la Vida: El cuerpo humano y sus sistemas', 
      intent: 'Que los estudiantes logren reconocer los órganos principales de la digestión y circulación, y sus funciones.',
      conceptual: 'Sistemas digestivo y circulatorio: órganos principales y cuidados básicos.',
      procedimental: 'Construcción de un modelo funcional del sistema respiratorio con botellas plásticas.',
      actitudinal: 'Adopción de medidas de higiene y alimentación saludable.',
      evaluation: 'Señala en esquemas los principales órganos internos y explica su función.'
    },
    { 
      id: 'seq-nat-2', 
      title: 'Ciencias Físicas: Estados de la materia', 
      intent: 'Que los estudiantes logren describir los estados físico-químicos del agua y simulen el ciclo hidrológico.',
      conceptual: 'Estados de la materia: sólido, líquido, gaseoso. Fusión y solidificación.',
      procedimental: 'Experimentación con cambios de estado térmicos del agua.',
      actitudinal: 'Aprecio por la conservación de los recursos hídricos.',
      evaluation: 'Explica con argumentos sencillos los cambios de estado físicos del agua.'
    }
  ]
};

const LOADING_ICONS = [
  { 
    icon: BookOpen, 
    colorClass: "text-blue-650 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40",
    ringClass: "border-blue-500 dark:border-blue-400",
    auraClass: "bg-blue-500/10"
  },
  { 
    icon: Calculator, 
    colorClass: "text-rose-650 dark:text-rose-455 bg-rose-50/80 dark:bg-rose-955/20 border-rose-100 dark:border-rose-900/40",
    ringClass: "border-rose-500 dark:border-rose-400",
    auraClass: "bg-rose-550/10"
  },
  { 
    icon: Globe, 
    colorClass: "text-amber-650 dark:text-amber-450 bg-amber-50/80 dark:bg-amber-955/20 border-amber-100 dark:border-amber-900/40",
    ringClass: "border-amber-500 dark:border-amber-400",
    auraClass: "bg-amber-550/10"
  },
  { 
    icon: Atom, 
    colorClass: "text-emerald-650 dark:text-emerald-450 bg-emerald-50/80 dark:bg-emerald-955/20 border-emerald-100 dark:border-emerald-900/40",
    ringClass: "border-emerald-500 dark:border-emerald-400",
    auraClass: "bg-emerald-550/10"
  },
  { 
    icon: Palette, 
    colorClass: "text-violet-650 dark:text-violet-450 bg-violet-50/80 dark:bg-violet-955/20 border-violet-100 dark:border-violet-900/40",
    ringClass: "border-violet-500 dark:border-violet-400",
    auraClass: "bg-violet-550/10"
  },
  { 
    icon: Activity, 
    colorClass: "text-cyan-650 dark:text-cyan-455 bg-cyan-50/80 dark:bg-cyan-955/20 border-cyan-100 dark:border-cyan-900/40",
    ringClass: "border-cyan-500 dark:border-cyan-400",
    auraClass: "bg-cyan-550/10"
  },
  { 
    icon: Brain, 
    colorClass: "text-pink-650 dark:text-pink-450 bg-pink-50/80 dark:bg-pink-955/20 border-pink-100 dark:border-pink-900/40",
    ringClass: "border-pink-500 dark:border-pink-400",
    auraClass: "bg-pink-550/10"
  },
];

const getGradeImageName = (gradeId: string): string => {
  const lower = gradeId.toLowerCase();
  if (lower.includes('1ro') || lower.includes('1ero')) return '1ero.webp';
  if (lower.includes('2do')) return '2do.webp';
  if (lower.includes('3ro') || lower.includes('3ero')) return '3ero.webp';
  if (lower.includes('4to')) return '4to.webp';
  if (lower.includes('5to')) return '5to.webp';
  if (lower.includes('6to')) return '6to.webp';
  return '';
};

const getSubjectBadgeText = (subjectId: string, gradeId: string): string => {
  const isPrimary = (gradeId || '').startsWith('primaria-');
  if (isPrimary && (subjectId === 'lengua-espanola' || subjectId === 'matematica')) {
    const isBaseGrades = gradeId.includes('1ro') || gradeId.includes('2do') || gradeId.includes('3ro');
    return isBaseGrades ? 'Con base' : 'Secuencia';
  }
  return 'Adecuación';
};

const getSubjectBadgeClass = (text: string): string => {
  if (text === 'Con base') return 'bg-blue-600 dark:bg-blue-500';
  if (text === 'Secuencia') return 'bg-indigo-600 dark:bg-indigo-500';
  return 'bg-emerald-600 dark:bg-emerald-500';
};

const SUBJECT_EMOJIS: Record<string, Record<string, string>> = {
  'primaria-1ro': {
    'lengua-espanola': 'A',
    'matematica': '🧮',
    'sociales': '🗺️',
    'naturales': '🌱',
    'formacion-humana': '💖',
    'educacion-artistica': '🎨',
    'educacion-fisica': '🏃'
  },
  'primaria-2do': {
    'lengua-espanola': '📒',
    'matematica': '🔢',
    'sociales': '🏛️',
    'naturales': '🌿',
    'formacion-humana': '🙏',
    'educacion-artistica': '🖌️',
    'educacion-fisica': '🎾'
  },
  'primaria-3ro': {
    'lengua-espanola': '✍️',
    'matematica': '➗',
    'sociales': '🧭',
    'naturales': '🦠',
    'formacion-humana': '🕊️',
    'educacion-artistica': '🎭',
    'educacion-fisica': '🏀'
  },
  'primaria-4to': {
    'lengua-espanola': '📓',
    'matematica': '🔢',
    'sociales': '🌍',
    'naturales': '🌻',
    'formacion-humana': '🤝',
    'educacion-artistica': '🧵',
    'educacion-fisica': '⚾'
  },
  'primaria-5to': {
    'lengua-espanola': '📚',
    'matematica': '📐',
    'sociales': '🌍',
    'naturales': '🧪',
    'formacion-humana': '🦋',
    'educacion-artistica': '🖍️',
    'educacion-fisica': '🏐'
  },
  'primaria-6to': {
    'lengua-espanola': '📖',
    'matematica': '🧊',
    'sociales': '📜',
    'naturales': '🔬',
    'formacion-humana': '🍎',
    'educacion-artistica': '🏺',
    'educacion-fisica': '🏊'
  }
};

export default function Planificador() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const [loaderIconIndex, setLoaderIconIndex] = useState(0);

  // Wizard state persistence
  const savedState = React.useMemo(() => {
    try {
      const raw = sessionStorage.getItem('plx:planificador_wizard_state');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }, []);

  const [currentStep, setCurrentStep] = useState<number>(() => savedState?.currentStep ?? 1);
  const [selectedLevel, setSelectedLevel] = useState<'INICIAL' | 'PRIMARIA' | 'SECUNDARIA' | null>(() => savedState?.selectedLevel ?? null);
  const [selectedCycle, setSelectedCycle] = useState<string | null>(() => savedState?.selectedCycle ?? null);
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    const rawGrade = savedState?.selectedGrade ?? '';
    const rawLevel = savedState?.selectedLevel ?? '';
    return normalizeGradeId(rawGrade, rawLevel);
  });
  const [selectedPlanningType, setSelectedPlanningType] = useState<string>(() => savedState?.selectedPlanningType ?? 'DIARIA');
  const [selectedSubject, setSelectedSubject] = useState<any>(() => savedState?.selectedSubject ?? null);
  const [selectedSequenceType, setSelectedSequenceType] = useState<'CON_BASE' | 'CURRICULAR'>(() => savedState?.selectedSequenceType ?? 'CON_BASE');
  const [selectedSequence, setSelectedSequence] = useState<any>(() => savedState?.selectedSequence ?? null);
  
  // Paso 6: Inicial Details
  const [classTitle, setClassTitle] = useState(() => savedState?.classTitle ?? '');
  const [classTopic, setClassTopic] = useState(() => savedState?.classTopic ?? '');
  const [pedagogicalIntent, setPedagogicalIntent] = useState(() => savedState?.pedagogicalIntent ?? '');
  const [additionalContext, setAdditionalContext] = useState(() => savedState?.additionalContext ?? '');

  // Paso 7: Editor Form details
  const [editorTitle, setEditorTitle] = useState(() => savedState?.editorTitle ?? '');
  const [editorIntent, setEditorIntent] = useState(() => savedState?.editorIntent ?? '');
  const [editorConceptual, setEditorConceptual] = useState(() => savedState?.editorConceptual ?? '');
  const [editorProcedimental, setEditorProcedimental] = useState(() => savedState?.editorProcedimental ?? '');
  const [editorActitudinal, setEditorActitudinal] = useState(() => savedState?.editorActitudinal ?? '');
  const [editorEvaluation, setEditorEvaluation] = useState(() => savedState?.editorEvaluation ?? '');
  const [editorHomework, setEditorHomework] = useState(() => savedState?.editorHomework ?? '');
  
  const [editorMomentos, setEditorMomentos] = useState(() => savedState?.editorMomentos ?? {
    inicio: 'Inicio de la clase con dinámica de presentación...',
    desarrollo: 'Desarrollo de las actividades prácticas con los alumnos...',
    cierre: 'Cierre del día mediante preguntas metacognitivas...'
  });

  const [editorResources, setEditorResources] = useState<string[]>(() => savedState?.editorResources ?? ['Pizarra', 'Cuaderno del alumno', 'Lápiz de colores']);
  const [newResourceInput, setNewResourceInput] = useState('');

  // AI Loading & inclusion modals
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showInclusionModal, setShowInclusionModal] = useState(false);
  const [inclusionType, setInclusionType] = useState<'DYSLEXIA' | 'ADHD' | 'AUTISM' | 'HIGH_CAPACITY' | null>(null);
  const [isGeneratingInclusion, setIsGeneratingInclusion] = useState(false);
  const [inclusionStrategies, setInclusionStrategies] = useState<string[]>([]);
  
  // Rubric state
  const [generatedRubric, setGeneratedRubric] = useState<any>(null);
  const [isGeneratingRubric, setIsGeneratingRubric] = useState(false);

  // Confirmation Modals
  const [showConfirmBackModal, setShowConfirmBackModal] = useState(false);
  const [showCreditsExhausted, setShowCreditsExhausted] = useState(false);

  const saveLessonPlan = (plan: LessonPlan, skipCredits: boolean = false) => {
    if (!skipCredits) {
      if (!hasEnoughCredits('save_planning')) {
        setShowCreditsExhausted(true);
        throw new Error('Créditos insuficientes');
      }
      const consumed = consumeCredits('save_planning');
      if (!consumed) {
        setShowCreditsExhausted(true);
        throw new Error('Créditos insuficientes');
      }
    }
    storageSaveLessonPlan(plan);
  };

  // Loading state when opening the final step (Form loading)
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  // Custom Form schemas states
  const [customFormSchema, setCustomFormSchema] = useState<any>(null);
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>(() => savedState?.customFieldsData ?? {});

  // Lengua Española 1er Grado specific wizard state
  const [lengSequenceIdx, setLengSequenceIdx] = useState<number>(() => savedState?.lengSequenceIdx ?? -1);
  const [lengBlockIdx, setLengBlockIdx] = useState<number>(() => savedState?.lengBlockIdx ?? -1);
  const [lengActivityIdx, setLengActivityIdx] = useState<number>(() => savedState?.lengActivityIdx ?? -1);

  // Matemática 1er Grado specific wizard state
  const [matSequenceIdx, setMatSequenceIdx] = useState<number>(() => savedState?.matSequenceIdx ?? -1);
  const [matBlockIdx, setMatBlockIdx] = useState<number>(() => savedState?.matBlockIdx ?? -1);
  const [matActivityIdx, setMatActivityIdx] = useState<number>(() => savedState?.matActivityIdx ?? -1);

  // Ciencias Sociales specific states
  const [selectedTheme, setSelectedTheme] = useState<any>(() => savedState?.selectedTheme ?? null);
  const [selectedSubtheme, setSelectedSubtheme] = useState<any>(() => savedState?.selectedSubtheme ?? null);
  const [customUnits, setCustomUnits] = useState<any[]>([]);

  // AI helper states inside step 3.5
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ name: string, subthemes: string[] }[]>([]);

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

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || 
      (typeof window !== "undefined" && window.location.hostname !== "localhost" 
        ? "https://planix-api.yeriorlando00.workers.dev" 
        : "http://localhost:8787");
    fetch(`${apiBase}/api/custom-units`)
      .then(res => res.json())
      .then((data: any) => {
        if (Array.isArray(data)) {
          setCustomUnits(data);
        }
      })
      .catch(err => console.error("Error fetching custom units from D1:", err));
  }, []);

  useEffect(() => {
    try {
      const stateObj = {
        currentStep,
        selectedLevel,
        selectedCycle,
        selectedGrade,
        selectedPlanningType,
        selectedSubject,
        selectedSequenceType,
        selectedSequence,
        selectedTheme,
        selectedSubtheme,
        classTitle,
        classTopic,
        pedagogicalIntent,
        additionalContext,
        editorTitle,
        editorIntent,
        editorConceptual,
        editorProcedimental,
        editorActitudinal,
        editorEvaluation,
        editorHomework,
        editorMomentos,
        editorResources,
        customFieldsData,
        lengSequenceIdx,
        lengBlockIdx,
        lengActivityIdx,
        matSequenceIdx,
        matBlockIdx,
        matActivityIdx,
      };
      sessionStorage.setItem('plx:planificador_wizard_state', JSON.stringify(stateObj));
    } catch (_) {}
  }, [
    currentStep,
    selectedLevel,
    selectedCycle,
    selectedGrade,
    selectedPlanningType,
    selectedSubject,
    selectedSequenceType,
    selectedSequence,
    selectedTheme,
    selectedSubtheme,
    classTitle,
    classTopic,
    pedagogicalIntent,
    additionalContext,
    editorTitle,
    editorIntent,
    editorConceptual,
    editorProcedimental,
    editorActitudinal,
    editorEvaluation,
    editorHomework,
    editorMomentos,
    editorResources,
    customFieldsData,
    lengSequenceIdx,
    lengBlockIdx,
    lengActivityIdx,
    matSequenceIdx,
    matBlockIdx,
    matActivityIdx,
  ]);

  const navigateToPlanificaciones = (delay = 1500) => {
    sessionStorage.removeItem('plx:planificador_wizard_state');
    sessionStorage.removeItem('plx:lengua1ro_draft');
    sessionStorage.removeItem('plx:matematica1ro_draft');
    sessionStorage.removeItem('plx:lengua2do_draft');
    sessionStorage.removeItem('plx:matematica2do_draft');
    sessionStorage.removeItem('plx:lengua3ro_draft');
    sessionStorage.removeItem('plx:matematica3ro_draft');
    sessionStorage.removeItem('plx:sociales1ro_draft');
    sessionStorage.removeItem('plx:naturales1ro_draft');
    sessionStorage.removeItem('plx:sociales2do_draft');
    sessionStorage.removeItem('plx:naturales2do_draft');
    sessionStorage.removeItem('plx:artistica1ro_draft');
    sessionStorage.removeItem('plx:artistica2do_draft');
    sessionStorage.removeItem('plx:educacionfisica1ro_diaria_draft');
    sessionStorage.removeItem('plx:educacionfisica1ro_unidad_draft');
    sessionStorage.removeItem('plx:educacionfisica2do_diaria_draft');
    sessionStorage.removeItem('plx:educacionfisica2do_unidad_draft');
    sessionStorage.removeItem('plx:formacion1ro_draft');
    sessionStorage.removeItem('plx:formacion2do_diaria_draft');
    sessionStorage.removeItem('plx:formacion2do_unidad_draft');
    sessionStorage.removeItem('plx:sociales3ro_draft');
    sessionStorage.removeItem('plx:naturales3ro_draft');
    sessionStorage.removeItem('plx:artistica3ro_draft');
    sessionStorage.removeItem('plx:educacionfisica3ro_diaria_draft');
    sessionStorage.removeItem('plx:educacionfisica3ro_unidad_draft');
    sessionStorage.removeItem('plx:formacion3ro_draft');
    sessionStorage.removeItem('plx:formacion3ro_unidad_draft');
    sessionStorage.removeItem('plx:sociales3ro_unidad_draft');
    sessionStorage.removeItem('plx:naturales3ro_unidad_draft');
    sessionStorage.removeItem('plx:artistica3ro_unidad_draft');

    // 4to Grado Drafts
    sessionStorage.removeItem('plx:lengua4to_draft');
    sessionStorage.removeItem('plx:matematica4to_draft');
    sessionStorage.removeItem('plx:sociales4to_draft');
    sessionStorage.removeItem('plx:naturales4to_draft');
    sessionStorage.removeItem('plx:artistica4to_draft');
    sessionStorage.removeItem('plx:artistica4to_unidad_draft');
    sessionStorage.removeItem('plx:educacionfisica4to_diaria_draft');
    sessionStorage.removeItem('plx:educacionfisica4to_unidad_draft');
    sessionStorage.removeItem('plx:formacion4to_draft');
    sessionStorage.removeItem('plx:formacion4to_unidad_draft');

    // 5to Grado Drafts
    sessionStorage.removeItem('plx:lengua5to_draft');
    sessionStorage.removeItem('plx:matematica5to_draft');
    sessionStorage.removeItem('plx:sociales5to_draft');
    sessionStorage.removeItem('plx:naturales5to_draft');
    sessionStorage.removeItem('plx:artistica5to_draft');
    sessionStorage.removeItem('plx:artistica5to_unidad_draft');
    sessionStorage.removeItem('plx:educacionfisica5to_diaria_draft');
    sessionStorage.removeItem('plx:educacionfisica5to_unidad_draft');
    sessionStorage.removeItem('plx:formacion5to_draft');
    sessionStorage.removeItem('plx:formacion5to_unidad_draft');

    // 6to Grado Drafts
    sessionStorage.removeItem('plx:lengua6to_draft');
    sessionStorage.removeItem('plx:matematica6to_draft');
    sessionStorage.removeItem('plx:sociales6to_draft');
    sessionStorage.removeItem('plx:naturales6to_draft');
    sessionStorage.removeItem('plx:artistica6to_draft');
    sessionStorage.removeItem('plx:artistica6to_unidad_draft');
    sessionStorage.removeItem('plx:educacionfisica6to_diaria_draft');
    sessionStorage.removeItem('plx:educacionfisica6to_unidad_draft');
    sessionStorage.removeItem('plx:formacion6to_draft');
    sessionStorage.removeItem('plx:formacion6to_unidad_draft');
    sessionStorage.removeItem('plx:sociales6to_unidad_draft');
    sessionStorage.removeItem('plx:naturales6to_unidad_draft');

    setTimeout(() => navigate('/planificaciones'), delay);
  };

  const getSequenceData = (seq: any) => {
    if (seq && dbSequences[seq.id]) {
      const dbSeq = dbSequences[seq.id];
      return {
        ...seq,
        ...dbSeq,
        order: dbSeq.order !== undefined && dbSeq.order !== null && dbSeq.order !== '' ? dbSeq.order : seq?.order,
        durationWeeks: dbSeq.durationWeeks !== undefined && dbSeq.durationWeeks !== null && dbSeq.durationWeeks !== '' ? dbSeq.durationWeeks : seq?.durationWeeks,
        description: dbSeq.description !== undefined && dbSeq.description !== null && dbSeq.description !== '' ? dbSeq.description : seq?.description,
        blocks: dbSeq.blocks || seq?.blocks || []
      };
    }
    return seq;
  };

  const isUnitBasedSubject = selectedSubject && (
    selectedSubject.id === 'sociales' || 
    selectedSubject.id === 'naturales' || 
    selectedSubject.id === 'educacion-artistica' || 
    selectedSubject.id === 'educacion-fisica' || 
    selectedSubject.id === 'formacion-humana' ||
    ((selectedSubject.id === 'matematica' || selectedSubject.id === 'lengua-espanola') && 
     !selectedGrade?.startsWith('primaria-'))
  );

  const saveUnitToD1 = async (unit: Unit) => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 
        (typeof window !== "undefined" && window.location.hostname !== "localhost" 
          ? "https://planix-api.yeriorlando00.workers.dev" 
          : "http://localhost:8787");
      const normalizedGrade = selectedGrade.replace(/^(primaria|secundaria|inicial)-/, '');
      await fetch(`${apiBase}/api/custom-units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: unit.id,
          subject_id: selectedSubject.id,
          grade_id: normalizedGrade,
          content: unit
        })
      });
      setCustomUnits(prev => {
        const idx = prev.findIndex(cu => cu.id === unit.id);
        if (idx !== -1) {
          return prev.map(cu => cu.id === unit.id ? { ...cu, content: unit } : cu);
        } else {
          return [...prev, { id: unit.id, subject_id: selectedSubject.id, grade_id: normalizedGrade, content: unit }];
        }
      });
      setSelectedSequence(unit);
    } catch (error) {
      console.error('Error saving unit:', error);
      toast.error('Error al sincronizar la unidad con el servidor.');
    }
  };

  const handleGenerateAiThemes = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const subjectName = selectedSubject?.name || '';
      const unitName = selectedSequence?.name || selectedSequence?.title || '';
      
      const gradeShort = (selectedGrade || '').toLowerCase().includes('1') ? '1ro' : 
                         (selectedGrade || '').toLowerCase().includes('2') ? '2do' :
                         (selectedGrade || '').toLowerCase().includes('3') ? '3ro' :
                         (selectedGrade || '').toLowerCase().includes('4') ? '4to' :
                         (selectedGrade || '').toLowerCase().includes('5') ? '5to' : '6to';

      const customSystemPrompt = `Eres un experto pedagogo de la adecuación curricular del MINERD de República Dominicana.`;

      const userMessage = `Genera 3 temas educativos innovadores para un profesor de ${gradeShort} de ${subjectName} sobre: "${aiPrompt || 'la unidad de ' + unitName}".
Cada tema debe tener exactamente 5 subtemas prácticos.
Responde ESTRICTAMENTE en formato JSON con la siguiente estructura (no envíes bloques de markdown ni texto descriptivo, solo el JSON):
{
  "themes": [
    {
      "name": "Nombre del Tema Curricular",
      "subthemes": [
        "Subtema 1",
        "Subtema 2",
        "Subtema 3",
        "Subtema 4",
        "Subtema 5"
      ]
    }
  ]
}`;
      
      const res = await generateToolContent('sugiere_temas', userMessage, customSystemPrompt);
      let suggestions = [];
      if (res) {
        if (Array.isArray(res)) {
          suggestions = res;
        } else if (res.themes && Array.isArray(res.themes)) {
          suggestions = res.themes;
        } else if (typeof res === 'object' && res.result) {
          try {
            const parsed = JSON.parse(res.result);
            suggestions = parsed.themes || parsed;
          } catch (_) {}
        }
      }

      if (Array.isArray(suggestions) && suggestions.length > 0) {
        setAiSuggestions(suggestions);
      } else {
        toast.error('La respuesta del servidor no tiene el formato esperado.');
      }
    } catch (error) {
      console.error('Error generating AI themes:', error);
      toast.error('Error al generar sugerencias de temas con IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyAiTheme = async (themeName: string, subthemeName: string, allSubthemesInTheme: string[]) => {
    if (!selectedSequence) return;
    
    const newThemeId = `t-custom-${Date.now()}`;
    const newTheme: any = {
      id: newThemeId,
      name: themeName,
      subthemes: allSubthemesInTheme.map((sub, idx) => ({
        id: `st-custom-${Date.now()}-${idx}`,
        name: sub
      }))
    };
    
    const updatedThemes = [...(selectedSequence.themes || []), newTheme];
    const updatedUnit = {
      ...selectedSequence,
      themes: updatedThemes
    };
    
    // Update UI state immediately for maximum speed and responsive UX
    setSelectedTheme(newTheme);
    const chosenSubtheme = newTheme.subthemes.find((s: any) => s.name === subthemeName) || newTheme.subthemes[0];
    setSelectedSubtheme(chosenSubtheme);
    
    setIsAiOpen(false);
    setAiSuggestions([]);
    setAiPrompt('');
    toast.success('Tema y subtemas de la IA aplicados a la unidad.');
    
    // Save to backend asynchronously in the background without blocking the UI
    saveUnitToD1(updatedUnit).catch(err => {
      console.error('Error in background save:', err);
    });
  };

  const prevLevelRef = React.useRef<string | null>(null);
  const prevSubjectIdRef = React.useRef<string | null>(null);

  // Load custom form schema when selector parameters change
  useEffect(() => {
    if (selectedLevel && selectedGrade && selectedSubject && selectedPlanningType) {
      // Exclude official native forms from custom schema loading
      if (
        ((selectedSubject.id === 'lengua-espanola' || selectedSubject.id === 'matematica') &&
         (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do' || selectedGrade === 'primaria-3ro') &&
         selectedPlanningType === 'DIARIA') ||
        (selectedSubject.id === 'sociales' && (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do') && selectedPlanningType === 'DIARIA') ||
        (selectedSubject.id === 'sociales' &&
         (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do' || selectedGrade === 'primaria-3ro') &&
         selectedPlanningType === 'UNIDAD') ||
        (selectedSubject.id === 'naturales' && (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do') && selectedPlanningType === 'DIARIA') ||
        (selectedSubject.id === 'naturales' && (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do') && selectedPlanningType === 'UNIDAD') ||
        (selectedSubject.id === 'educacion-artistica' && (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do')) ||
        (selectedSubject.id === 'educacion-fisica' && (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do')) ||
        (selectedSubject.id === 'formacion-humana' && (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do'))
      ) {
        setCustomFormSchema(null);
        return;
      }

      const key = `plx:custom_form:${selectedLevel.toLowerCase()}:${selectedGrade}:${selectedSubject.id}:${selectedPlanningType.toLowerCase()}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCustomFormSchema(parsed);
          
          // Seed initial values for custom fields
          const initialData: Record<string, any> = {};
          parsed.fields.forEach((f: any) => {
            if (f.type === 'momentos') {
              initialData[f.id] = {
                inicio: 'Inicio de la clase con dinámica de presentación...',
                desarrollo: 'Desarrollo de las actividades prácticas con los alumnos...',
                cierre: 'Cierre del día mediante preguntas metacognitivas...'
              };
            } else if (f.type === 'competencias') {
              initialData[f.id] = ['Competencia Comunicativa', 'Competencia de Pensamiento Lógico, Creativo y Crítico'];
            } else {
              initialData[f.id] = f.defaultValue || '';
            }
          });
          setCustomFieldsData(initialData);
        } catch (e) {
          console.error("Error parsing custom form schema", e);
          setCustomFormSchema(null);
        }
      } else {
        setCustomFormSchema(null);
      }
    }
  }, [selectedLevel, selectedGrade, selectedSubject, selectedPlanningType]);

  // Professional loading effect when opening step 4
  useEffect(() => {
    if (currentStep === 4) {
      setIsLoadingForm(true);
      setLoadingTextIndex(0);
      
      const textInterval = setInterval(() => {
        setLoadingTextIndex(prev => (prev < 3 ? prev + 1 : prev));
      }, 400);

      const timer = setTimeout(() => {
        setIsLoadingForm(false);
      }, 1600);

      return () => {
        clearInterval(textInterval);
        clearTimeout(timer);
      };
    }
  }, [currentStep]);

  // Rotate academic loading icons every 230ms for dynamic layout
  useEffect(() => {
    let interval: any;
    if (isLoadingForm) {
      interval = setInterval(() => {
        setLoaderIconIndex(prev => (prev + 1) % LOADING_ICONS.length);
      }, 230);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoadingForm]);

  // Initialize from user registration profile or allowed_subjects
  useEffect(() => {
    if (user && user.rol !== "admin") {
      if (!selectedLevel && user.nivel) {
        setSelectedLevel(user.nivel.toUpperCase() as any);
      }
      
      if (!selectedGrade) {
        let initialGrade = user.grado;
        // If user has allowed_subjects and their default grade is not in it, fallback to the first allowed grade
        if (user.allowed_subjects && Object.keys(user.allowed_subjects).length > 0) {
          const allowedGrades = Object.keys(user.allowed_subjects);
          const normalizedInitial = normalizeGradeId(initialGrade, user.nivel);
          if (!normalizedInitial || !allowedGrades.includes(normalizedInitial)) {
            initialGrade = allowedGrades[0];
          } else {
            initialGrade = normalizedInitial;
          }
        } else {
          initialGrade = normalizeGradeId(initialGrade, user.nivel);
        }

        if (initialGrade) {
          setSelectedGrade(initialGrade);
          const isFirstCycle = initialGrade.includes("1ro") || initialGrade.includes("2do") || initialGrade.includes("3ro");
          setSelectedCycle(isFirstCycle ? "ciclo1" : "ciclo2");
        }
      }
    }
  }, [user]);

  // Load defaults or update fields when selections change
  useEffect(() => {
    // Only clear selections if the level actually changed from a previously set level
    if (prevLevelRef.current !== null && selectedLevel !== prevLevelRef.current) {
      setSelectedCycle(null);
      setSelectedGrade('');
      setSelectedSubject(null);
      setSelectedSequence(null);
    }
    prevLevelRef.current = selectedLevel;
  }, [selectedLevel]);

  useEffect(() => {
    if (selectedSubject) {
      if (prevSubjectIdRef.current !== null && selectedSubject.id !== prevSubjectIdRef.current) {
        setSelectedSequence(null);
      }
      prevSubjectIdRef.current = selectedSubject.id;
    } else {
      prevSubjectIdRef.current = null;
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (currentStep === 3.5 && !selectedSequence) {
      setCurrentStep(3);
    }
  }, [currentStep, selectedSequence]);

  useEffect(() => {
    if (selectedSequence) {
      setPedagogicalIntent(selectedSequence.intent || '');
      setClassTopic(selectedSequence.title || '');
      setClassTitle(`Planificación: ${selectedSequence.title || 'Tema'}`);
      
      // Seed Editor fields
      setEditorTitle(`Planificación: ${selectedSequence.title || 'Tema'}`);
      setEditorIntent(selectedSequence.intent || '');
      setEditorConceptual(selectedSequence.conceptual || '');
      setEditorProcedimental(selectedSequence.procedimental || '');
      setEditorActitudinal(selectedSequence.actitudinal || '');
      setEditorEvaluation(selectedSequence.evaluation || '');

      if (selectedSequence.customMoments) {
        setEditorMomentos(selectedSequence.customMoments);
      }
      if (selectedSequence.customResources) {
        setEditorResources(selectedSequence.customResources);
      }
      if (selectedSequence.homework) {
        setEditorHomework(selectedSequence.homework);
      }
    }
  }, [selectedSequence]);

  if (!user) return null;

  // Level Options
  const levelOptions = [
    { id: 'INICIAL', name: 'Nivel Inicial', icon: '🎨', color: 'from-pink-400 to-rose-500', bg: 'bg-pink-500/10' },
    { id: 'PRIMARIA', name: 'Nivel Primario', icon: '📚', color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-500/10' },
    { id: 'SECUNDARIA', name: 'Nivel Secundario', icon: '🎓', color: 'from-purple-400 to-violet-500', bg: 'bg-purple-500/10' }
  ].filter(opt => {
    if (user.rol === "admin" || !user.nivel) return true;
    return opt.id === user.nivel.toUpperCase();
  });

  // Grade Options filtered by level and user profile / allowed_subjects
  const activeLevelData = selectedLevel ? EDUCATION_STRUCTURE[selectedLevel] : null;
  const gradeOptions: any[] = [];
  if (activeLevelData) {
    activeLevelData.cycles.forEach(c => {
      c.grades.forEach(g => {
        if (user.rol === "admin") {
          gradeOptions.push(g);
          return;
        }

        // Filter based on allowed_subjects keys if defined
        if (user.allowed_subjects && Object.keys(user.allowed_subjects).length > 0) {
          if (user.allowed_subjects[g.id]) {
            gradeOptions.push(g);
          }
          return;
        }

        // Fallback to default grade
        if (!user.grado || g.id === user.grado) {
          gradeOptions.push(g);
        }
      });
    });
  }

  // Subject Options filtered by level, grade and allowed_subjects
  const filteredSubjects = OFFICIAL_DEFAULT_SUBJECTS.filter(s => {
    if (s.level !== selectedLevel) return false;
    if (!selectedGrade) return true;

    // Hide Lengua Española and Matemática for Unidad planning type in 1st-4th grade of Primary
    if (selectedPlanningType === 'UNIDAD' &&
        (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do' || selectedGrade === 'primaria-3ro' || selectedGrade === 'primaria-4to') &&
        (s.id === 'lengua-espanola' || s.id === 'matematica')) {
      return false;
    }

    // Filter by allowed subjects if user is a teacher and has allowed subjects for this grade
    if (user.rol !== "admin" && user.allowed_subjects && user.allowed_subjects[selectedGrade]) {
      return user.allowed_subjects[selectedGrade].includes(s.id);
    }

    const normalizedGrade = selectedGrade.replace(/^(primaria|secundaria|inicial)-/, '');
    return s.grades.some(g => {
      const gNorm = g.toLowerCase().replace(/[\s-_]/g, '');
      const selNorm = normalizedGrade.toLowerCase().replace(/[\s-_]/g, '');
      return gNorm === selNorm || gNorm.includes(selNorm) || selNorm.includes(gNorm);
    });
  });

  // Sequences filtered by subject key
  const getSubjectSequenceKey = () => {
    if (!selectedSubject) return 'lengua-espanola';
    const id = selectedSubject.id.toLowerCase();
    if (id.includes('lengua')) return 'lengua-espanola';
    if (id.includes('matematica')) return 'matematica';
    if (id.includes('naturales')) return 'naturales';
    return 'lengua-espanola'; // fallback
  };
  const activeSequences = MOCK_SEQUENCES[getSubjectSequenceKey()] || [];

  // Wizard Nav Handlers
  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedLevel) {
        toast.error('Por favor, selecciona un Nivel Educativo.');
        return;
      }
      if (!selectedGrade) {
        toast.error('Por favor, selecciona un Grado.');
        return;
      }
      if (!selectedPlanningType) {
        toast.error('Por favor, selecciona un Tipo de Planificación.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedSubject) {
        toast.error('Por favor, selecciona una Asignatura.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (selectedSequenceType === 'CON_BASE' && !selectedSequence) {
        toast.error(isUnitBasedSubject ? 'Por favor, selecciona una Unidad de Aprendizaje.' : 'Por favor, selecciona una Secuencia Didáctica.');
        return;
      }
      if (selectedSequenceType === 'CURRICULAR' && !classTopic.trim()) {
        toast.error('Por favor, ingresa el Tema de la clase.');
        return;
      }

      // If unit based subject and daily planning, go to theme/subtheme selector (3.5)
      if (isUnitBasedSubject && selectedPlanningType === 'DIARIA' && selectedSequenceType === 'CON_BASE') {
        setCurrentStep(3.5);
        return;
      }

      // Set editor defaults: use custom values if already set, or fall back to sequence/topic
      const defaultTitle = classTitle.trim() || selectedSequence?.title || selectedSequence?.name || (classTopic.trim() ? `Plan Diario: ${classTopic}` : 'Planificación sin título');
      const defaultIntent = pedagogicalIntent.trim() || selectedSequence?.intent || '';
      
      setEditorTitle(defaultTitle);
      setEditorIntent(defaultIntent);

      setCurrentStep(4);
    } else if (currentStep === 3.5) {
      if (!selectedTheme) {
        toast.error('Por favor, selecciona un Tema.');
        return;
      }
      if (!selectedSubtheme) {
        toast.error('Por favor, selecciona un Subtema.');
        return;
      }

      // Set editor defaults
      const defaultTitle = classTitle.trim() || `${selectedTheme.name} - ${selectedSubtheme.name}`;
      const defaultIntent = pedagogicalIntent.trim() || '';
      
      setEditorTitle(defaultTitle);
      setEditorIntent(defaultIntent);

      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep === 4) {
      setShowConfirmBackModal(true);
    } else if (currentStep === 3.5) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // Add a resource tag
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (newResourceInput.trim()) {
      setEditorResources([...editorResources, newResourceInput.trim()]);
      setNewResourceInput('');
      toast.success('Recurso añadido');
    }
  };

  const handleRemoveResource = (index: number) => {
    setEditorResources(editorResources.filter((_, i) => i !== index));
  };

  // Save the complete planning
  const handleSave = () => {
    if (!customFormSchema && !editorTitle.trim()) {
      toast.error('El título de la planificación es obligatorio.');
      return;
    }

    // Gating check for save_planning credits
    if (!hasEnoughCredits('save_planning')) {
      setShowCreditsExhausted(true);
      return;
    }

    // Consume the credit
    const consumed = consumeCredits('save_planning');
    if (!consumed) return;

    // Determine custom fields or fallbacks
    const resolvedTitle = customFormSchema 
      ? (customFieldsData['titulo'] || customFieldsData['centro_educativo'] || `Plan: ${selectedSubject?.name || 'Clase'}`)
      : editorTitle.trim();

    const resolvedIntent = customFormSchema
      ? (customFieldsData['intencion_pedagogica'] || customFieldsData['momentos']?.inicio || 'Planificación personalizada')
      : editorIntent;

    const resolvedResources = customFormSchema
      ? (customFieldsData['recursos_adicionales'] || editorResources)
      : editorResources;

    const resolvedMomentos = customFormSchema
      ? (customFieldsData['momentos'] || editorMomentos)
      : editorMomentos;

    const resolvedTarea = customFormSchema
      ? (customFieldsData['tarea_hogar'] || editorHomework)
      : editorHomework;

    const resolvedEvaluation = customFormSchema
      ? (customFieldsData['evaluacion_metacognicion'] || editorEvaluation)
      : editorEvaluation;

    const planData: LessonPlan = {
      id: uid('plan'),
      docente_id: user.id,
      titulo: resolvedTitle,
      tipo: selectedSequenceType,
      nivel: selectedLevel?.toLowerCase() as any,
      grado: selectedGrade,
      asignatura: selectedSubject?.name || 'Asignatura',
      secuencia_id: selectedSequence?.id,
      intencion_pedagogica: resolvedIntent,
      recursos: resolvedResources,
      momentos: resolvedMomentos,
      tarea: resolvedTarea,
      conceptual: editorConceptual,
      procedimental: editorProcedimental,
      actitudinal: editorActitudinal,
      evaluacion: resolvedEvaluation,
      creado_en: new Date().toISOString(),
      customFields: customFormSchema ? customFieldsData : undefined,
      customFormSchema: customFormSchema || undefined
    };

    saveLessonPlan(planData, true);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    toast.success('¡Planificación guardada!');
    navigateToPlanificaciones(1500);
  };

  const handleSaveNative = (customFieldsData: any) => {
    // Gating check for save_planning credits
    if (!hasEnoughCredits('save_planning')) {
      setShowCreditsExhausted(true);
      return;
    }

    // Consume the credit
    const consumed = consumeCredits('save_planning');
    if (!consumed) return;

    const resolvedTitle = customFieldsData.actividad_titulo || `Plan Diario: ${customFieldsData.secuencia}`;
    const resolvedIntent = customFieldsData.intencion_pedagogica;
    const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
    const resolvedMomentos = {
      inicio: customFieldsData.momentos?.[0]?.descripcion || '',
      desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
      cierre: customFieldsData.momentos?.[2]?.descripcion || ''
    };
    const resolvedTarea = customFieldsData.tarea_hogar;
    const resolvedEvaluation = customFieldsData.evaluacion;

    const planData: LessonPlan = {
      id: uid('plan'),
      docente_id: user.id,
      titulo: resolvedTitle,
      tipo: selectedSequenceType,
      nivel: selectedLevel?.toLowerCase() as any,
      grado: selectedGrade,
      asignatura: selectedSubject?.name || 'Asignatura',
      secuencia_id: selectedSequence?.id,
      bloque_id: customFieldsData.bloque,
      actividad_id: customFieldsData.actividad_id,
      intencion_pedagogica: resolvedIntent,
      recursos: resolvedResources,
      momentos: resolvedMomentos,
      tarea: resolvedTarea,
      conceptual: customFieldsData.secuencia,
      procedimental: (customFieldsData.momentos || []).map((m: any) => m.descripcion).join('\n\n'),
      actitudinal: selectedSubject?.id === 'matematica' ? 'Curiosidad y rigor matemático.' : 'Disposición al diálogo y respeto.',
      evaluacion: resolvedEvaluation,
      creado_en: new Date().toISOString(),
      customFields: customFieldsData
    };

    saveLessonPlan(planData, true);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    toast.success('¡Planificación guardada!');
    navigateToPlanificaciones(1500);
  };

  // Simulating AI generation for the daily form
  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    toast.loading('Generando contenido pedagógico con IA...', { id: 'ai-gen' });

    // Call dynamic log to console terminal
    try {
      await fetch('/api/log-terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'REQUEST',
          provider: 'Gemini AI',
          model: 'gemini-2.5-flash',
          message: `Generando Plan Diario de ${selectedSubject?.name} para ${selectedGrade}. Tema: ${classTopic || 'General'}`
        })
      });
    } catch {}

    setTimeout(() => {
      if (customFormSchema) {
        // AI fill for custom fields
        const updatedFields = { ...customFieldsData };
        customFormSchema.fields.forEach((field: any) => {
          if (field.type === 'text') {
            if (field.id === 'centro_educativo') updatedFields[field.id] = 'Colegio Dominicano de la Salle';
            else if (field.id === 'docente') updatedFields[field.id] = user.nombre || 'María Rodríguez';
            else if (field.id === 'grado') updatedFields[field.id] = `${selectedGrade} Primaria`;
            else if (field.id === 'seccion') updatedFields[field.id] = 'A';
            else if (field.id === 'area') updatedFields[field.id] = selectedSubject?.name || 'Lengua Española';
            else if (field.id === 'secuencia') updatedFields[field.id] = classTopic || 'La conversación';
            else if (field.id === 'fecha') updatedFields[field.id] = new Date().toISOString().split('T')[0];
            else updatedFields[field.id] = `Plan de ${field.label}`;
          } else if (field.type === 'textarea' || field.type === 'richtext') {
            updatedFields[field.id] = `[Optimizado por IA] Contenido curricular redactado basado en "${classTopic || 'Tema central'}" bajo las directrices oficiales del MINERD de República Dominicana.`;
          } else if (field.type === 'select') {
            updatedFields[field.id] = field.options && field.options.length > 0 ? field.options[0] : '';
          } else if (field.type === 'momentos') {
            updatedFields[field.id] = {
              inicio: `[15 min] Actividad de inicio: Dinámica de exploración de saberes previos sobre ${classTopic || 'el tema'}. Presentación de la intención pedagógica del día.`,
              desarrollo: `[45 min] Actividad de desarrollo: Explicación de los conceptos nucleares utilizando un mapa conceptual interactivo. Ejercicios individuales guiados y puesta en común de resultados en la pizarra.`,
              cierre: `[10 min] Actividad de cierre: Preguntas metacognitivas breves ("¿Qué aprendiste hoy?") y aclaración de dudas finales.`
            };
          } else if (field.type === 'competencias') {
            updatedFields[field.id] = ['Competencia Comunicativa', 'Competencia de Pensamiento Lógico, Creativo y Crítico'];
          } else if (field.type === 'evaluacion_metacognicion') {
            updatedFields[field.id] = `Metacognición:\n¿Cómo te sentiste al realizar la actividad?\n¿En qué tuviste dificultad?\n\nEvaluación (Rúbrica):\nCriterio: Participa de forma autónoma y fluida en la resolución de problemas asociados a ${classTopic || 'la secuencia'}.`;
          } else if (field.type === 'tarea_hogar') {
            updatedFields[field.id] = `Investigar 3 ejemplos prácticos en la vida cotidiana de ${classTopic || 'el contenido aprendido'}.`;
          }
        });
        setCustomFieldsData(updatedFields);
      } else {
        if (selectedSubject?.id === 'lengua-espanola' && (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do' || selectedGrade === 'primaria-3ro')) {
          setEditorIntent(`Propiciar que los alumnos de 1er grado reconozcan y escriban palabras sencillas en español y desarrollen competencias de lectura inicial mediante actividades lúdicas e interactivas.`);
          setEditorConceptual(`Comprensión oral y escrita. El abecedario, correspondencia fonema-grafema, vocales y consonantes en palabras del vocabulario escolar.`);
          setEditorProcedimental(`Identificación auditiva de sonidos iniciales, formación de palabras con letras móviles y copia de enunciados cortos.`);
          setEditorActitudinal(`Interés, disfrute y valoración por la lectura y escritura como medios para comunicarse con su entorno.`);
          setEditorMomentos({
            inicio: `[15 min] Dinámica del abecedario cantado. Se presenta la letra/tema del día en la pizarra. Exploración oral mediante preguntas como "¿Qué palabras conocen que empiecen con esta letra?"`,
            desarrollo: `[45 min] Formación de palabras seleccionadas utilizando las letras móviles individuales. Lectura guiada en voz alta de un texto corto en el papelógrafo y copia ordenada de palabras en el cuaderno.`,
            cierre: `[15 min] Cierre de la clase. Cada estudiante expone una palabra formada y responde a la pregunta metacognitiva: "¿Qué sonido nuevo descubrimos hoy?"`
          });
          setEditorEvaluation(`Instrumento de lista de cotejo. Indicador de Logro: Identifica y escribe palabras de su vocabulario cotidiano utilizando correspondencia fonema-grafema básica.`);
          setEditorHomework(`Jugar en el hogar a buscar tres objetos cotidianos que comiencen con la primera letra de su nombre propio y dibujarlos en el cuaderno.`);
        } else {
          // Mocked AI output enriched with MINERD vocabulary
          setEditorIntent(`Facilitar la comprensión de los alumnos en el tema "${classTopic || 'Contenido Principal'}" mediante el uso de organizadores gráficos y trabajo cooperativo, impulsando la competencia comunicativa.`);
          setEditorConceptual(`Conceptos clave relativos a ${classTopic || 'la unidad curricular seleccionada'}. Estructuras formales e identificación semántica.`);
          setEditorProcedimental(`Análisis descriptivo del entorno, clasificación de elementos característicos y registro sistemático en plantillas.`);
          setEditorActitudinal(`Curiosidad investigativa, cooperación proactiva y valoración del aprendizaje autónomo en la resolución de problemas.`);
          
          setEditorMomentos({
            inicio: `[10 mins] Apertura de la sesión escolar. Se inicia con la lectura reflexiva de una efeméride o cita motivadora. Presentación del tema del día "${classTopic || 'Tema General'}". Exploración de saberes previos mediante lluvia de ideas estructurada en la pizarra.`,
            desarrollo: `[30 mins] Desarrollo de la secuencia didáctica. El docente modela el contenido utilizando un bento de recursos interactivos. Formación de comunidades de aprendizaje de 3 estudiantes. Realización del ejercicio práctico de identificación en hojas de trabajo. Explicación oral del proceso.`,
            cierre: `[5 mins] Proceso de metacognición. Los estudiantes completan un boleto de salida respondiendo de forma oral a dos preguntas clave: "¿Qué aprendí en el día de hoy?" y "¿Cómo puedo aplicarlo en mi hogar?"`
          });

          setEditorEvaluation(`Instrumento de rúbrica analítica y observación directa. Indicador de Logro principal: Aplica adecuadamente las estructuras lingüísticas o lógicas conceptuales aprendidas para resolver situaciones prácticas.`);
          setEditorHomework(`Dibujar en el cuaderno familiar un mapa mental conceptual que resuma la actividad de aprendizaje del día de hoy y conversar sobre ello con sus tutores.`);
        }
      }

      // Log success to terminal
      fetch('/api/log-terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SUCCESS',
          provider: 'Gemini AI',
          model: 'gemini-2.5-flash',
          message: 'Plan de clase generado exitosamente',
          details: { tokensPrompt: 384, tokensGenerados: 940 }
        })
      }).catch(() => {});

      setIsGeneratingAI(false);
      toast.dismiss('ai-gen');
      toast.success('¡Plan de clase optimizado por IA exitosamente!');
      confetti({ particleCount: 30, spread: 40 });
    }, 2500);
  };

  // Inclusion adaptation generation
  const handleGenerateInclusion = () => {
    if (!inclusionType) return;

    setIsGeneratingInclusion(true);
    toast.loading('Generando adaptaciones curriculares inclusivas...', { id: 'inclusion-gen' });

    setTimeout(() => {
      let strategies: string[] = [];
      if (inclusionType === 'DYSLEXIA') {
        strategies = [
          '**Uso de fuentes tipográficas adaptadas**: Imprimir las fichas de trabajo en fuentes como OpenDyslexic con interlineado amplio.',
          '**Apoyo de pictogramas y lecturas grabadas**: Proveer un código QR con el audio del texto que los estudiantes puedan escuchar en paralelo.',
          '**Evaluación formativa oral**: Permitir que el estudiante exponga su respuesta de forma verbal en lugar de obligar la redacción extensa.'
        ];
      } else if (inclusionType === 'ADHD') {
        strategies = [
          '**Instrucciones segmentadas (Paso a paso)**: Dividir la actividad de desarrollo en 3 micro-tareas con marcas de tiempo explícitas.',
          '**Pausas activas de enfoque**: Permitir 1 minuto de estiramiento controlado entre el momento de inicio y el de desarrollo.',
          '**Apoyo visual checklist**: Entregar un mini-checklist físico en su pupitre para tachar las tareas terminadas.'
        ];
      } else if (inclusionType === 'AUTISM') {
        strategies = [
          '**Anticipación de la rutina diaria**: Presentar una agenda visual con dibujos de los tres momentos de la clase al iniciar.',
          '**Ambiente de trabajo regulado**: Reducir estímulos visuales en el área de trabajo individual y permitir uso de audífonos atenuadores.',
          '**Socialización guiada**: Asignar roles muy específicos e inequívocos en el trabajo grupal para evitar ansiedad.'
        ];
      } else if (inclusionType === 'HIGH_CAPACITY') {
        strategies = [
          '**Retos de profundización cognitiva**: Asignar una tarea de extensión para investigar y redactar un caso de uso avanzado del tema.',
          '**Liderazgo de comunidades de aprendizaje**: Permitir que el estudiante actúe como tutor de apoyo de sus pares.',
          '**Formulación de hipótesis alternativas**: Solicitar que proponga dos variantes de resolución diferentes a la planteada por el docente.'
        ];
      }

      setInclusionStrategies(strategies);
      
      // Append strategies to the homework or development section
      const adapterHeader = `\n\n=== ESTRATEGIAS DE INCLUSIÓN Y ADECUACIÓN CURRICULAR ===\n`;
      const formattedStrats = strategies.map(s => `• ${s.replace(/\*\*/g, '')}`).join('\n');
      setEditorProcedimental(prev => prev + adapterHeader + formattedStrats);
      
      setIsGeneratingInclusion(false);
      setShowInclusionModal(false);
      setInclusionType(null);
      toast.dismiss('inclusion-gen');
      toast.success('Adaptaciones añadidas a la sección procedimental.');
      confetti({ particleCount: 15, spread: 30 });
    }, 1800);
  };

  // Generate Rubric from criteria
  const handleGenerateRubric = () => {
    setIsGeneratingRubric(true);
    toast.loading('Diseñando rúbrica analítica dominicana con IA...', { id: 'rubric-gen' });

    setTimeout(() => {
      const isSecundaria = selectedLevel === 'SECUNDARIA';
      const rubric = {
        id: uid('rub'),
        title: `Rúbrica: ${classTopic || 'Evaluación del Tema'}`,
        description: 'Instrumento formativo diseñado para medir el indicador de logro.',
        dimensions: [
          {
            aspect: 'Comprensión y Aplicación',
            levels: isSecundaria ? {
              receptivo: 'Identifica la información con apoyo constante.',
              resolutivo: 'Resuelve problemas básicos aplicando el concepto.',
              autonomo: 'Desarrolla las actividades de forma independiente y fluida.',
              estrategico: 'Aplica el aprendizaje en diferentes contextos de forma innovadora.'
            } : {
              elemental: 'Identifica el concepto únicamente con apoyo del docente.',
              aceptable: 'Comprende el concepto básico y realiza la tarea con poca guía.',
              satisfactorio: 'Explica con claridad y autonomía la aplicación del concepto.'
            }
          },
          {
            aspect: 'Procedimiento y Rigor',
            levels: isSecundaria ? {
              receptivo: 'Sigue pasos de forma incompleta.',
              resolutivo: 'Completa la secuencia procedimental básica recomendada.',
              autonomo: 'Aplica el procedimiento completo con organización propia.',
              estrategico: 'Optimiza el procedimiento demostrando soluciones creativas.'
            } : {
              elemental: 'Presenta dificultades en la ejecución de la secuencia práctica.',
              aceptable: 'Sigue el procedimiento básico y alcanza la meta.',
              satisfactorio: 'Realiza el procedimiento con total orden y precisión técnica.'
            }
          }
        ]
      };

      setGeneratedRubric(rubric);
      
      // Append rubric text preview to evaluation field
      const rubricHeader = `\n\n=== RÚBRICA DE EVALUACIÓN GENERADA ===\n`;
      const formattedRubric = rubric.dimensions.map(d => {
        return `Aspecto: ${d.aspect}\n` + Object.entries(d.levels).map(([k, v]) => ` - ${k.toUpperCase()}: ${v}`).join('\n');
      }).join('\n\n');
      
      setEditorEvaluation(prev => prev + rubricHeader + formattedRubric);

      setIsGeneratingRubric(false);
      toast.dismiss('rubric-gen');
      toast.success('Rúbrica analítica integrada en la evaluación.');
    }, 2000);
  };

  const isLengFormStep = currentStep === 4 && selectedSubject?.id === 'lengua-espanola' && (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do' || selectedGrade === 'primaria-3ro' || selectedGrade === 'primaria-4to' || selectedGrade === 'primaria-5to' || selectedGrade === 'primaria-6to') && selectedPlanningType === 'DIARIA';
  const isMatFormStep = currentStep === 4 && selectedSubject?.id === 'matematica' && (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do' || selectedGrade === 'primaria-3ro' || selectedGrade === 'primaria-4to' || selectedGrade === 'primaria-5to' || selectedGrade === 'primaria-6to') && selectedPlanningType === 'DIARIA';

  if (currentStep === 4 && isLoadingForm) {
    const currentIconData = LOADING_ICONS[loaderIconIndex];
    const SubjectIcon = currentIconData.icon;
    const loadingTexts = [
      "Cargando Formulario...",
      "Estructurando competencias específicas y fundamentales...",
      `Cargando secuencias de ${selectedSubject?.name || "Asignatura"}...`,
      "Estamos preparando tu entorno de planificación personalizada."
    ];
    return (
      <main className="fixed inset-0 z-40 bg-bg-base text-[#1B1B1B] dark:text-zinc-150 flex flex-col items-center justify-center select-none text-center p-6">
        <Toaster position="top-center" richColors />
        <div className="flex flex-col items-center justify-center max-w-xl w-full mx-auto animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center w-20 h-20 mb-5">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-205 dark:border-zinc-800" />
            <div className={`absolute inset-0 rounded-full border-4 ${currentIconData.ringClass} border-t-transparent border-r-transparent animate-spin`} style={{ animationDuration: '0.9s' }} />
            
            {/* Glowing aura */}
            <div className={`absolute w-16 h-16 rounded-full ${currentIconData.auraClass} blur-xl animate-pulse`} />
            
            {/* Inner icon container with a soft pulse */}
            <div className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-sm border transition-all duration-300 ${currentIconData.colorClass}`}>
              <SubjectIcon className="w-6.5 h-6.5" />
            </div>
          </div>

          <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight animate-pulse">
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
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-full"
            />
          </div>
        </div>
      </main>
    );
  }

  if (isLengFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          {selectedGrade === 'primaria-1ro' ? (
            <LenguaEspañola
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              lengSequenceIdx={lengSequenceIdx}
              lengBlockIdx={lengBlockIdx}
              lengActivityIdx={lengActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={handleSaveNative}
            />
          ) : selectedGrade === 'primaria-2do' ? (
            <LenguaEspañola2do
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              lengSequenceIdx={lengSequenceIdx}
              lengBlockIdx={lengBlockIdx}
              lengActivityIdx={lengActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={handleSaveNative}
            />
          ) : selectedGrade === 'primaria-3ro' ? (
            <LenguaEspañola3ro
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              lengSequenceIdx={lengSequenceIdx}
              lengBlockIdx={lengBlockIdx}
              lengActivityIdx={lengActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={handleSaveNative}
            />
          ) : selectedGrade === 'primaria-4to' ? (
            <LenguaEspañola4to
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              lengSequenceIdx={lengSequenceIdx}
              lengBlockIdx={lengBlockIdx}
              lengActivityIdx={lengActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={handleSaveNative}
            />
          ) : selectedGrade === 'primaria-5to' ? (
            <LenguaEspañola5to
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              lengSequenceIdx={lengSequenceIdx}
              lengBlockIdx={lengBlockIdx}
              lengActivityIdx={lengActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={handleSaveNative}
            />
          ) : (
            <LenguaEspañola6to
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              lengSequenceIdx={lengSequenceIdx}
              lengBlockIdx={lengBlockIdx}
              lengActivityIdx={lengActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={handleSaveNative}
            />
          )}
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      const gradeSuffix = selectedGrade === 'primaria-1ro' ? '1ro' : selectedGrade === 'primaria-2do' ? '2do' : '3ro';
                      sessionStorage.removeItem(`plx:lengua${gradeSuffix}_draft`);
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  if (isMatFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          {selectedGrade === 'primaria-1ro' ? (
            <Matematica
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              matSequenceIdx={matSequenceIdx}
              matBlockIdx={matBlockIdx}
              matActivityIdx={matActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={handleSaveNative}
            />
          ) : selectedGrade === 'primaria-2do' ? (
            <Matematica2do
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              matSequenceIdx={matSequenceIdx}
              matBlockIdx={matBlockIdx}
              matActivityIdx={matActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={handleSaveNative}
            />
          ) : selectedGrade === 'primaria-3ro' ? (
            <Matematica3ro
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              matSequenceIdx={matSequenceIdx}
              matBlockIdx={matBlockIdx}
              matActivityIdx={matActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={handleSaveNative}
            />
          ) : selectedGrade === 'primaria-4to' ? (
            <Matematica4to
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              matSequenceIdx={matSequenceIdx}
              matBlockIdx={matBlockIdx}
              matActivityIdx={matActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={handleSaveNative}
            />
          ) : selectedGrade === 'primaria-5to' ? (
            <Matematica5to
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              matSequenceIdx={matSequenceIdx}
              matBlockIdx={matBlockIdx}
              matActivityIdx={matActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={handleSaveNative}
            />
          ) : (
            <Matematica6to
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              matSequenceIdx={matSequenceIdx}
              matBlockIdx={matBlockIdx}
              matActivityIdx={matActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={handleSaveNative}
            />
          )}
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      const gradeSuffix = selectedGrade === 'primaria-1ro' ? '1ro' : selectedGrade === 'primaria-2do' ? '2do' : '3ro';
                      sessionStorage.removeItem(`plx:matematica${gradeSuffix}_draft`);
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isNaturales1roFormStep = currentStep === 4 && selectedSubject?.id === 'naturales' && selectedGrade === 'primaria-1ro' && selectedPlanningType === 'DIARIA';

  if (isNaturales1roFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasNaturalesDiaria
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:naturales1ro_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isNaturales2doFormStep = currentStep === 4 && selectedSubject?.id === 'naturales' && selectedGrade === 'primaria-2do' && selectedPlanningType === 'DIARIA';

  if (isNaturales2doFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasNaturalesDiaria2do
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:naturales2do_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isNaturales3roFormStep = currentStep === 4 && selectedSubject?.id === 'naturales' && selectedGrade === 'primaria-3ro' && selectedPlanningType === 'DIARIA';

  if (isNaturales3roFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasNaturalesDiaria3ro
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:naturales3ro_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFisica1roFormStep = currentStep === 4 && selectedSubject?.id === 'educacion-fisica' && selectedGrade === 'primaria-1ro' && selectedPlanningType === 'DIARIA';

  if (isFisica1roFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionFisicaDiaria
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:educacionfisica1ro_diaria_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFisica2doFormStep = currentStep === 4 && selectedSubject?.id === 'educacion-fisica' && selectedGrade === 'primaria-2do' && selectedPlanningType === 'DIARIA';

  if (isFisica2doFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionFisicaDiaria2do
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-855 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:educacionfisica2do_diaria_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFisica3roFormStep = currentStep === 4 && selectedSubject?.id === 'educacion-fisica' && selectedGrade === 'primaria-3ro' && selectedPlanningType === 'DIARIA';

  if (isFisica3roFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionFisicaDiaria3ro
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:educacionfisica3ro_diaria_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFormacion1roFormStep = currentStep === 4 && selectedSubject?.id === 'formacion-humana' && selectedGrade === 'primaria-1ro' && selectedPlanningType === 'DIARIA';

  if (isFormacion1roFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <FormacionHumanaDiaria
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:formacion1ro_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFormacion2doFormStep = currentStep === 4 && selectedSubject?.id === 'formacion-humana' && selectedGrade === 'primaria-2do' && selectedPlanningType === 'DIARIA';

  if (isFormacion2doFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <FormacionHumanaDiaria2do
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:formacion2do_diaria_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFormacion3roFormStep = currentStep === 4 && selectedSubject?.id === 'formacion-humana' && selectedGrade === 'primaria-3ro' && selectedPlanningType === 'DIARIA';

  if (isFormacion3roFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <FormacionHumanaDiaria3ro
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:formacion3ro_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isArtistica1roFormStep = currentStep === 4 && selectedSubject?.id === 'educacion-artistica' && selectedGrade === 'primaria-1ro' && selectedPlanningType === 'DIARIA';

  if (isArtistica1roFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionArtisticaDiaria
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:artistica1ro_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isArtistica2doFormStep = currentStep === 4 && selectedSubject?.id === 'educacion-artistica' && selectedGrade === 'primaria-2do' && selectedPlanningType === 'DIARIA';

  if (isArtistica2doFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionArtisticaDiaria2do
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:artistica2do_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isArtistica3roFormStep = currentStep === 4 && selectedSubject?.id === 'educacion-artistica' && selectedGrade === 'primaria-3ro' && selectedPlanningType === 'DIARIA';

  if (isArtistica3roFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionArtisticaDiaria3ro
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:artistica3ro_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isSociales1roFormStep = currentStep === 4 && selectedSubject?.id === 'sociales' && selectedGrade === 'primaria-1ro' && selectedPlanningType === 'DIARIA';

  if (isSociales1roFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasSocialesDiaria
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:sociales1ro_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isSociales2doFormStep = currentStep === 4 && selectedSubject?.id === 'sociales' && selectedGrade === 'primaria-2do' && selectedPlanningType === 'DIARIA';

  if (isSociales2doFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasSocialesDiaria2do
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:sociales2do_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isSociales3roFormStep = currentStep === 4 && selectedSubject?.id === 'sociales' && selectedGrade === 'primaria-3ro' && selectedPlanningType === 'DIARIA';

  if (isSociales3roFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasSocialesDiaria3ro
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:sociales3ro_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isSociales4toFormStep = currentStep === 4 && selectedSubject?.id === 'sociales' && selectedGrade === 'primaria-4to' && selectedPlanningType === 'DIARIA';

  if (isSociales4toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasSocialesDiaria4to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:sociales4to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isSociales5toFormStep = currentStep === 4 && selectedSubject?.id === 'sociales' && selectedGrade === 'primaria-5to' && selectedPlanningType === 'DIARIA';

  if (isSociales5toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasSocialesDiaria5to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:sociales5to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isSociales4toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'sociales' &&
    (selectedGrade === 'primaria-4to') &&
    selectedPlanningType === 'UNIDAD';

  if (isSociales4toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasSocialesUnidad4to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Sociales'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación guardada exitosamente!', { id: 'plan-save' });
              setTimeout(() => navigateToPlanificaciones(1500), 1600);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:sociales4to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isSociales5toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'sociales' &&
    (selectedGrade === 'primaria-5to') &&
    selectedPlanningType === 'UNIDAD';

  if (isSociales5toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasSocialesUnidad5to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Sociales'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación guardada exitosamente!', { id: 'plan-save' });
              setTimeout(() => navigateToPlanificaciones(1500), 1600);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:sociales5to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isArtistica4toFormStep = currentStep === 4 && selectedSubject?.id === 'educacion-artistica' && selectedGrade === 'primaria-4to' && selectedPlanningType === 'DIARIA';

  if (isArtistica4toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionArtisticaDiaria4to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:artistica4to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isArtistica5toFormStep = currentStep === 4 && selectedSubject?.id === 'educacion-artistica' && selectedGrade === 'primaria-5to' && selectedPlanningType === 'DIARIA';

  if (isArtistica5toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionArtisticaDiaria5to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:artistica5to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFisica4toFormStep = currentStep === 4 && selectedSubject?.id === 'educacion-fisica' && selectedGrade === 'primaria-4to' && selectedPlanningType === 'DIARIA';

  if (isFisica4toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionFisicaDiaria4to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:educacionfisica4to_diaria_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFisica5toFormStep = currentStep === 4 && selectedSubject?.id === 'educacion-fisica' && selectedGrade === 'primaria-5to' && selectedPlanningType === 'DIARIA';

  if (isFisica5toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionFisicaDiaria5to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:educacionfisica5to_diaria_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFormacion4toFormStep = currentStep === 4 && selectedSubject?.id === 'formacion-humana' && selectedGrade === 'primaria-4to' && selectedPlanningType === 'DIARIA';

  if (isFormacion4toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <FormacionHumanaDiaria4to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:formacion4to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFormacion5toFormStep = currentStep === 4 && selectedSubject?.id === 'formacion-humana' && selectedGrade === 'primaria-5to' && selectedPlanningType === 'DIARIA';

  if (isFormacion5toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <FormacionHumanaDiaria5to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:formacion5to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isArtistica4toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'educacion-artistica' &&
    (selectedGrade === 'primaria-4to') &&
    selectedPlanningType === 'UNIDAD';

  if (isArtistica4toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionArtisticaUnidad4to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Artística'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:artistica4to_unidad_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isArtistica5toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'educacion-artistica' &&
    (selectedGrade === 'primaria-5to') &&
    selectedPlanningType === 'UNIDAD';

  if (isArtistica5toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionArtisticaUnidad5to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Artística'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:artistica5to_unidad_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFisica4toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'educacion-fisica' &&
    (selectedGrade === 'primaria-4to') &&
    selectedPlanningType === 'UNIDAD';

  if (isFisica4toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionFisicaUnidad4to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Física'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:educacionfisica4to_unidad_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFisica5toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'educacion-fisica' &&
    (selectedGrade === 'primaria-5to') &&
    selectedPlanningType === 'UNIDAD';

  if (isFisica5toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionFisicaUnidad5to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Física'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:educacionfisica5to_unidad_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFormacion4toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'formacion-humana' &&
    (selectedGrade === 'primaria-4to') &&
    selectedPlanningType === 'UNIDAD';

  if (isFormacion4toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <FormacionHumanaUnidad4to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Formación'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:formacion4to_unidad_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFormacion5toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'formacion-humana' &&
    (selectedGrade === 'primaria-5to') &&
    selectedPlanningType === 'UNIDAD';

  if (isFormacion5toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <FormacionHumanaUnidad5to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Formación'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:formacion5to_unidad_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isNaturales4toFormStep = currentStep === 4 && selectedSubject?.id === 'naturales' && selectedGrade === 'primaria-4to' && selectedPlanningType === 'DIARIA';

  if (isNaturales4toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasNaturalesDiaria4to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:naturales4to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isNaturales5toFormStep = currentStep === 4 && selectedSubject?.id === 'naturales' && selectedGrade === 'primaria-5to' && selectedPlanningType === 'DIARIA';

  if (isNaturales5toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasNaturalesDiaria5to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:naturales5to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isNaturalesUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'naturales' &&
    (selectedGrade === 'primaria-1ro') &&
    selectedPlanningType === 'UNIDAD';

  if (isNaturalesUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasNaturalesUnidad
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Naturales'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:naturales1ro_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isNaturales2doUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'naturales' &&
    (selectedGrade === 'primaria-2do') &&
    selectedPlanningType === 'UNIDAD';

  if (isNaturales2doUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasNaturalesUnidad2do
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Naturales'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:naturales2do_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isNaturales3roUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'naturales' &&
    (selectedGrade === 'primaria-3ro') &&
    selectedPlanningType === 'UNIDAD';

  if (isNaturales3roUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasNaturalesUnidad3ro
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Naturales'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:naturales3ro_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isNaturales4toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'naturales' &&
    (selectedGrade === 'primaria-4to') &&
    selectedPlanningType === 'UNIDAD';

  if (isNaturales4toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasNaturalesUnidad4to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Naturales'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:naturales4to_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isNaturales5toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'naturales' &&
    (selectedGrade === 'primaria-5to') &&
    selectedPlanningType === 'UNIDAD';

  if (isNaturales5toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasNaturalesUnidad5to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Naturales'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:naturales5to_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFisicaUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'educacion-fisica' &&
    (selectedGrade === 'primaria-1ro') &&
    selectedPlanningType === 'UNIDAD';

  if (isFisicaUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionFisicaUnidad
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Física'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:educacionfisica1ro_unidad_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFisica2doUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'educacion-fisica' &&
    (selectedGrade === 'primaria-2do') &&
    selectedPlanningType === 'UNIDAD';

  if (isFisica2doUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionFisicaUnidad2do
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Física'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:educacionfisica2do_unidad_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFisica3roUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'educacion-fisica' &&
    (selectedGrade === 'primaria-3ro') &&
    selectedPlanningType === 'UNIDAD';

  if (isFisica3roUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionFisicaUnidad3ro
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Física'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-450 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:educacionfisica3ro_unidad_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFormacionUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'formacion-humana' &&
    (selectedGrade === 'primaria-1ro') &&
    selectedPlanningType === 'UNIDAD';

  if (isFormacionUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <FormacionHumanaUnidad
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Formación'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:formacion1ro_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFormacion2doUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'formacion-humana' &&
    (selectedGrade === 'primaria-2do') &&
    selectedPlanningType === 'UNIDAD';

  if (isFormacion2doUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <FormacionHumanaUnidad2do
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Formación'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:formacion2do_unidad_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isFormacion3roUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'formacion-humana' &&
    (selectedGrade === 'primaria-3ro') &&
    selectedPlanningType === 'UNIDAD';

  if (isFormacion3roUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <FormacionHumanaUnidad3ro
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Formación'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-450 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-455" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:formacion3ro_unidad_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isArtisticaUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'educacion-artistica' &&
    (selectedGrade === 'primaria-1ro') &&
    selectedPlanningType === 'UNIDAD';

  if (isArtisticaUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionArtisticaUnidad
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Artística'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:artistica1ro_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isArtistica2doUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'educacion-artistica' &&
    (selectedGrade === 'primaria-2do') &&
    selectedPlanningType === 'UNIDAD';

  if (isArtistica2doUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionArtisticaUnidad2do
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Artística'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:artistica2do_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isArtistica3roUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'educacion-artistica' &&
    (selectedGrade === 'primaria-3ro') &&
    selectedPlanningType === 'UNIDAD';

  if (isArtistica3roUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionArtisticaUnidad3ro
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Artística'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:artistica3ro_unidad_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isSocialesUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'sociales' &&
    (selectedGrade === 'primaria-1ro') &&
    selectedPlanningType === 'UNIDAD';

  if (isSocialesUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasSocialesUnidad
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Sociales'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:sociales1ro_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isSociales2doUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'sociales' &&
    (selectedGrade === 'primaria-2do') &&
    selectedPlanningType === 'UNIDAD';

  if (isSociales2doUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasSocialesUnidad2do
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Sociales'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:sociales2do_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  const isSociales3roUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'sociales' &&
    (selectedGrade === 'primaria-3ro') &&
    selectedPlanningType === 'UNIDAD';

  if (isSociales3roUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasSocialesUnidad3ro
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Sociales'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación de Unidad guardada!');
              navigateToPlanificaciones(1500);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmBackModal(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:sociales3ro_unidad_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  // ============================================
  // 6TO GRADO FORM STEPS
  // ============================================

  // --- Sociales 6to Diaria ---
  const isSociales6toFormStep = currentStep === 4 && selectedSubject?.id === 'sociales' && selectedGrade === 'primaria-6to' && selectedPlanningType === 'DIARIA';

  if (isSociales6toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasSocialesDiaria6to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:sociales6to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  // --- Sociales 6to Unidad ---
  const isSociales6toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'sociales' &&
    (selectedGrade === 'primaria-6to') &&
    selectedPlanningType === 'UNIDAD';

  if (isSociales6toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasSocialesUnidad6to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Sociales'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación guardada exitosamente!', { id: 'plan-save' });
              setTimeout(() => navigateToPlanificaciones(1500), 1600);
            }}
          />
        </div>

        {/* CONFIRMATION BACK STEP MODAL */}
        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:sociales6to_unidad_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos
          isOpen={showCreditsExhausted}
          onClose={() => setShowCreditsExhausted(false)}
          requiredCredits={15}
          currentCredits={getUserCredits(user)}
        />
      </main>
    );
  }

  // --- Naturales 6to Diaria ---
  const isNaturales6toFormStep = currentStep === 4 && selectedSubject?.id === 'naturales' && selectedGrade === 'primaria-6to' && selectedPlanningType === 'DIARIA';

  if (isNaturales6toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasNaturalesDiaria6to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
              >
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button type="button" onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95">
                    Cancelar
                  </button>
                  <button type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:naturales6to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos isOpen={showCreditsExhausted} onClose={() => setShowCreditsExhausted(false)} requiredCredits={15} currentCredits={getUserCredits(user)} />
      </main>
    );
  }

  // --- Naturales 6to Unidad ---
  const isNaturales6toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'naturales' &&
    (selectedGrade === 'primaria-6to') &&
    selectedPlanningType === 'UNIDAD';

  if (isNaturales6toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <CienciasNaturalesUnidad6to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Naturales'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación guardada exitosamente!', { id: 'plan-save' });
              setTimeout(() => navigateToPlanificaciones(1500), 1600);
            }}
          />
        </div>

        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center">
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button type="button" onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95">
                    Cancelar
                  </button>
                  <button type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:naturales6to_unidad_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos isOpen={showCreditsExhausted} onClose={() => setShowCreditsExhausted(false)} requiredCredits={15} currentCredits={getUserCredits(user)} />
      </main>
    );
  }

  // --- Artística 6to Diaria ---
  const isArtistica6toFormStep = currentStep === 4 && selectedSubject?.id === 'educacion-artistica' && selectedGrade === 'primaria-6to' && selectedPlanningType === 'DIARIA';

  if (isArtistica6toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionArtisticaDiaria6to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center">
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button type="button" onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95">
                    Cancelar
                  </button>
                  <button type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:artistica6to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos isOpen={showCreditsExhausted} onClose={() => setShowCreditsExhausted(false)} requiredCredits={15} currentCredits={getUserCredits(user)} />
      </main>
    );
  }

  // --- Artística 6to Unidad ---
  const isArtistica6toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'educacion-artistica' &&
    (selectedGrade === 'primaria-6to') &&
    selectedPlanningType === 'UNIDAD';

  if (isArtistica6toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionArtisticaUnidad6to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Educación Artística'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación guardada exitosamente!', { id: 'plan-save' });
              setTimeout(() => navigateToPlanificaciones(1500), 1600);
            }}
          />
        </div>

        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center">
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button type="button" onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95">
                    Cancelar
                  </button>
                  <button type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:artistica6to_unidad_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos isOpen={showCreditsExhausted} onClose={() => setShowCreditsExhausted(false)} requiredCredits={15} currentCredits={getUserCredits(user)} />
      </main>
    );
  }

  // --- Educación Física 6to Diaria ---
  const isFisica6toFormStep = currentStep === 4 && selectedSubject?.id === 'educacion-fisica' && selectedGrade === 'primaria-6to' && selectedPlanningType === 'DIARIA';

  if (isFisica6toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionFisicaDiaria6to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center">
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button type="button" onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95">
                    Cancelar
                  </button>
                  <button type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:educacionfisica6to_diaria_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos isOpen={showCreditsExhausted} onClose={() => setShowCreditsExhausted(false)} requiredCredits={15} currentCredits={getUserCredits(user)} />
      </main>
    );
  }

  // --- Educación Física 6to Unidad ---
  const isFisica6toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'educacion-fisica' &&
    (selectedGrade === 'primaria-6to') &&
    selectedPlanningType === 'UNIDAD';

  if (isFisica6toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <EducacionFisicaUnidad6to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Educación Física'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación guardada exitosamente!', { id: 'plan-save' });
              setTimeout(() => navigateToPlanificaciones(1500), 1600);
            }}
          />
        </div>

        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center">
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button type="button" onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95">
                    Cancelar
                  </button>
                  <button type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:educacionfisica6to_unidad_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos isOpen={showCreditsExhausted} onClose={() => setShowCreditsExhausted(false)} requiredCredits={15} currentCredits={getUserCredits(user)} />
      </main>
    );
  }

  // --- Formación Humana 6to Diaria ---
  const isFormacion6toFormStep = currentStep === 4 && selectedSubject?.id === 'formacion-humana' && selectedGrade === 'primaria-6to' && selectedPlanningType === 'DIARIA';

  if (isFormacion6toFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <FormacionHumanaDiaria6to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={handleSaveNative}
          />
        </div>

        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center">
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-450" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button type="button" onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95">
                    Cancelar
                  </button>
                  <button type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:formacion6to_draft');
                      setCurrentStep(3.5);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos isOpen={showCreditsExhausted} onClose={() => setShowCreditsExhausted(false)} requiredCredits={15} currentCredits={getUserCredits(user)} />
      </main>
    );
  }

  // --- Formación Humana 6to Unidad ---
  const isFormacion6toUnidadFormStep = currentStep === 4 &&
    selectedSubject?.id === 'formacion-humana' &&
    (selectedGrade === 'primaria-6to') &&
    selectedPlanningType === 'UNIDAD';

  if (isFormacion6toUnidadFormStep) {
    return (
      <main className="flex-1 flex flex-col w-full min-w-0 pb-6 overflow-visible bg-bg-base text-[#1B1B1B] dark:text-zinc-150 relative">
        <Toaster position="top-center" richColors />
        <div className="px-6 md:px-[60px] xl:px-16 w-full">
          <FormacionHumanaUnidad6to
            user={user}
            selectedSequence={selectedSequence}
            selectedTheme={selectedTheme}
            selectedSubtheme={selectedSubtheme}
            selectedSequenceType={selectedSequenceType}
            selectedLevel={selectedLevel}
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedPlanningType={selectedPlanningType}
            onBack={handleBack}
            onCancel={() => {
              toast.error('Planificación cancelada');
              navigateToPlanificaciones(1000);
            }}
            onSave={(customFieldsData) => {
              const resolvedTitle = customFieldsData.titulo || `Unidad: ${selectedSequence?.name || 'Formación Humana'}`;
              const resolvedIntent = customFieldsData.intencion_pedagogica;
              const resolvedResources = (customFieldsData.momentos || []).flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
              const resolvedMomentos = {
                inicio: customFieldsData.momentos?.[0]?.descripcion || '',
                desarrollo: customFieldsData.momentos?.[1]?.descripcion || '',
                cierre: customFieldsData.momentos?.[2]?.descripcion || ''
              };
              const resolvedTarea = customFieldsData.tarea_hogar;
              const resolvedEvaluation = customFieldsData.evaluacion;

              const planData: LessonPlan = {
                id: uid('plan'),
                docente_id: user.id,
                titulo: resolvedTitle,
                tipo: selectedSequenceType,
                nivel: selectedLevel?.toLowerCase() as any,
                grado: selectedGrade,
                asignatura: selectedSubject?.name || 'Asignatura',
                secuencia_id: selectedSequence?.id,
                intencion_pedagogica: resolvedIntent,
                recursos: resolvedResources,
                momentos: resolvedMomentos,
                tarea: resolvedTarea,
                conceptual: customFieldsData.conceptual || '',
                procedimental: customFieldsData.procedural || '',
                actitudinal: customFieldsData.attitudinal || '',
                evaluacion: resolvedEvaluation,
                creado_en: new Date().toISOString(),
                customFields: customFieldsData
              };

              saveLessonPlan(planData);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              toast.success('¡Planificación guardada exitosamente!', { id: 'plan-save' });
              setTimeout(() => navigateToPlanificaciones(1500), 1600);
            }}
          />
        </div>

        <AnimatePresence>
          {showConfirmBackModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowConfirmBackModal(false)}
               className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-850 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center">
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button type="button" onClick={() => setShowConfirmBackModal(false)}
                    className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95">
                    Cancelar
                  </button>
                  <button type="button"
                    onClick={() => {
                      setShowConfirmBackModal(false);
                      sessionStorage.removeItem('plx:formacion6to_unidad_draft');
                      setCurrentStep(3);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    Sí, Volver
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalCreditos isOpen={showCreditsExhausted} onClose={() => setShowCreditsExhausted(false)} requiredCredits={15} currentCredits={getUserCredits(user)} />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col pt-10 xl:pt-[44px] px-6 md:px-[60px] xl:px-16 w-full min-w-0 pb-6 overflow-visible bg-bg-base relative">
      <Toaster position="top-center" richColors />

      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-card-pink/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-card-green/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Academic Icons Background */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none select-none">
        {/* Left Side */}
        <BookOpen className="absolute top-8 left-6 text-neutral-900" size={75} style={{ transform: "rotate(-12deg)" }} />
        <School className="absolute top-12 left-[22%] text-neutral-900" size={65} style={{ transform: "rotate(-8deg)" }} />
        <PenTool className="absolute top-[30%] left-[28%] text-neutral-900" size={55} style={{ transform: "rotate(15deg)" }} />
        <Languages className="absolute top-[26%] left-16 text-neutral-900" size={55} style={{ transform: "rotate(15deg)" }} />
        <Lightbulb className="absolute top-[48%] left-6 text-neutral-900" size={55} style={{ transform: "rotate(25deg)" }} />
        <Target className="absolute top-[56%] left-[24%] text-neutral-900" size={60} style={{ transform: "rotate(-10deg)" }} />
        <FlaskConical className="absolute bottom-[24%] left-24 text-neutral-900" size={60} style={{ transform: "rotate(-20deg)" }} />
        <Palette className="absolute bottom-32 left-[14%] text-neutral-900" size={70} style={{ transform: "rotate(-15deg)" }} />
        <Library className="absolute bottom-10 left-8 text-neutral-900" size={80} style={{ transform: "rotate(10deg)" }} />
        <BookMarked className="absolute bottom-[5%] left-[26%] text-neutral-900" size={60} style={{ transform: "rotate(12deg)" }} />

        {/* Center Bottom */}
        <Brain className="absolute bottom-[6%] left-[48%] text-neutral-900" size={60} style={{ transform: "rotate(-5deg)" }} />

        {/* Right Side */}
        <GraduationCap className="absolute top-8 right-6 text-neutral-900" size={85} style={{ transform: "rotate(15deg)" }} />
        <Atom className="absolute top-12 right-[22%] text-neutral-900" size={75} style={{ transform: "rotate(-5deg)" }} />
        <Scroll className="absolute top-[30%] right-[28%] text-neutral-900" size={55} style={{ transform: "rotate(-15deg)" }} />
        <Shapes className="absolute top-[26%] right-16 text-neutral-900" size={65} style={{ transform: "rotate(-10deg)" }} />
        <Globe className="absolute top-[48%] right-6 text-neutral-900" size={70} style={{ transform: "rotate(-15deg)" }} />
        <Compass className="absolute top-[56%] right-[24%] text-neutral-900" size={55} style={{ transform: "rotate(12deg)" }} />
        <Notebook className="absolute bottom-[24%] right-24 text-neutral-900" size={60} style={{ transform: "rotate(18deg)" }} />
        <Award className="absolute bottom-32 right-[14%] text-neutral-900" size={75} style={{ transform: "rotate(-20deg)" }} />
        <Calculator className="absolute bottom-10 right-8 text-neutral-900" size={70} style={{ transform: "rotate(12deg)" }} />
        <Music className="absolute bottom-[5%] right-[26%] text-neutral-900" size={55} style={{ transform: "rotate(-8deg)" }} />
      </div>

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col relative z-10">

        {/* Title */}
        <div className="mb-8 text-center mt-2">
          <h1 className="text-3xl md:text-4xl font-black text-[#1B1B1B] dark:text-white leading-tight">
            Asistente de Planificación Curricular
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-bold mt-1">
            Diseña planificaciones pedagógicas completas alineadas.
          </p>
        </div>

        {/* Indicador de pasos profesional e interactivo */}
        <div className="flex items-center justify-between mb-8 select-none max-w-xl mx-auto w-full pt-2">
          {[
            { step: 1, label: 'Estructura' },
            { step: 2, label: 'Asignatura' },
            { step: 3, label: 'Secuencia' },
            { step: 4, label: 'Redacción' }
          ].map((item, idx) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            return (
              <React.Fragment key={item.step}>
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                      isActive 
                        ? 'bg-[#1e40af] text-white ring-4 ring-[#1e40af]/15' 
                        : isCompleted 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
                    }`}
                  >
                    {isCompleted ? '✓' : item.step}
                  </div>
                  <span className={`text-[11.5px] font-bold transition-all ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-zinc-550'}`}>
                    {item.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all ${currentStep > item.step ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-zinc-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

      {/* Main Wizard Area */}
      <div className="flex-1 w-full min-h-[380px] bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-[32px] p-6 md:p-8 shadow-xs dark:shadow-none flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-1 w-full flex flex-col justify-between"
          >
            {/* Paso 1: Configuración de Nivel y Grado */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
                <div className="text-center">
                  <p className="text-base md:text-lg font-black text-[#1e40af] dark:text-blue-400">
                    Selecciona el nivel educativo, grado y tipo de estrategia pedagógica.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Nivel Educativo Principal Switcher */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-widest text-center">
                      Nivel Educativo
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto w-full justify-center select-none items-center">
                      {levelOptions.map((opt) => {
                        const isSelected = selectedLevel === opt.id;
                        const imageName = opt.id === 'INICIAL' ? 'inicial.webp' : opt.id === 'PRIMARIA' ? 'primario.webp' : 'secundario.webp';

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              if (opt.id === "INICIAL") {
                                toast.warning("El Nivel Inicial estará disponible próximamente.");
                                return;
                              }
                              setSelectedLevel(opt.id as any);
                              setSelectedGrade('');
                            }}
                            className={`transition-all duration-300 border-0 bg-transparent outline-none ring-0 p-0 flex justify-center cursor-pointer ${
                              isSelected 
                                ? 'scale-[1.05] z-10' 
                                : selectedLevel 
                                  ? 'opacity-55 dark:opacity-40 hover:opacity-100 hover:scale-[1.02]' 
                                  : 'hover:scale-[1.02]'
                            }`}
                          >
                            <img 
                              src={`/niveles/${imageName}`}
                              alt={opt.name}
                              className="w-full max-w-[240px] h-auto object-contain"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grado Académico */}
                  <AnimatePresence mode="wait" initial={false}>
                    {selectedLevel && (
                      <motion.div
                        key={selectedLevel}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="flex flex-col gap-3"
                      >
                        <label className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-widest text-center">
                          Grado Académico
                        </label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-3xl mx-auto w-full items-center justify-center">
                          {gradeOptions.map(grade => {
                            const isActive = selectedGrade === grade.id;
                            const gradeImage = getGradeImageName(grade.id);
                            const folderName = selectedLevel === 'PRIMARIA' ? 'Primario' : selectedLevel === 'SECUNDARIA' ? 'Secundario' : '';
                            const imagePath = folderName ? `/grados/${folderName}/${gradeImage}` : `/grados/${gradeImage}`;

                            if (gradeImage) {
                              return (
                                <button
                                  key={grade.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedGrade(grade.id);
                                    const isFirstCycle = grade.id.includes("1ro") || grade.id.includes("2do") || grade.id.includes("3ro");
                                    setSelectedCycle(isFirstCycle ? "ciclo1" : "ciclo2");
                                  }}
                                  className={`transition-all duration-300 border-0 bg-transparent outline-none ring-0 p-0 flex justify-center cursor-pointer ${
                                    isActive
                                      ? 'scale-[1.05] z-10'
                                      : selectedGrade
                                        ? 'opacity-55 dark:opacity-40 hover:opacity-100 hover:scale-[1.02]'
                                        : 'hover:scale-[1.02]'
                                  }`}
                                >
                                  <img 
                                    src={imagePath}
                                    alt={grade.name}
                                    className="w-full max-w-[110px] h-auto object-contain"
                                  />
                                </button>
                              );
                            }

                            return (
                              <motion.button
                                key={grade.id}
                                type="button"
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.88 }}
                                onClick={() => {
                                  setSelectedGrade(grade.id);
                                  const isFirstCycle = grade.id.includes("1ro") || grade.id.includes("2do") || grade.id.includes("3ro");
                                  setSelectedCycle(isFirstCycle ? "ciclo1" : "ciclo2");
                                }}
                                className={`relative py-5 px-3 rounded-xl text-[14px] font-black flex flex-col items-center justify-center border min-h-[88px] w-full cursor-pointer transition-all duration-205 ${
                                  isActive
                                    ? 'bg-[#1e40af] text-white border-[#1e40af] ring-2 ring-[#1e40af]/25'
                                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-350 border-slate-200 dark:border-zinc-800/80 hover:border-[#1e40af]/30 hover:bg-[#1e40af]/[0.02]'
                                }`}
                              >
                                <span className="text-[16px] font-black">{grade.name.replace(" Sec", "")}</span>
                                <span className={`text-[9.5px] font-bold uppercase tracking-wider mt-1 ${isActive ? 'text-white/70' : 'text-slate-400 dark:text-zinc-555'}`}>Grado</span>
                                {isActive && (
                                  <div className="absolute top-2.5 right-2.5 rounded-full bg-white/25 text-white p-0.5 shadow-xs shrink-0">
                                    <Check size={10} strokeWidth={4} />
                                  </div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Estrategia de Planificación */}
                  <AnimatePresence mode="wait" initial={false}>
                    {selectedGrade && (
                      <motion.div
                        key={selectedGrade}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="flex flex-col gap-3"
                      >
                        <label className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-widest text-center">
                          TIPO DE PLANIFICACIÓN
                        </label>
                        <div className="grid grid-cols-2 gap-4 max-w-[420px] mx-auto w-full justify-center select-none items-center">
                          <button
                            type="button"
                            onClick={() => setSelectedPlanningType("DIARIA")}
                            className={`transition-all duration-300 border-0 bg-transparent outline-none ring-0 p-0 flex justify-center cursor-pointer ${
                              selectedPlanningType === "DIARIA"
                                ? 'scale-[1.05] z-10'
                                : selectedPlanningType
                                  ? 'opacity-55 dark:opacity-40 hover:opacity-100 hover:scale-[1.02]'
                                  : 'hover:scale-[1.02]'
                            }`}
                          >
                            <img 
                              src="/planificacion/diaria.webp"
                              alt="Plan Diario"
                              className="w-full max-w-[190px] h-auto object-contain"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedPlanningType("UNIDAD")}
                            className={`transition-all duration-300 border-0 bg-transparent outline-none ring-0 p-0 flex justify-center cursor-pointer ${
                              selectedPlanningType === "UNIDAD"
                                ? 'scale-[1.05] z-10'
                                : selectedPlanningType
                                  ? 'opacity-55 dark:opacity-40 hover:opacity-100 hover:scale-[1.02]'
                                  : 'hover:scale-[1.02]'
                            }`}
                          >
                            <img 
                              src="/planificacion/unidad.webp"
                              alt="Unidad"
                              className="w-full max-w-[190px] h-auto object-contain"
                            />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Paso 2: Selección de Asignatura */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white text-center">
                    Selección de Asignatura
                  </h2>
                  <p className="text-[13px] text-slate-500 dark:text-zinc-450 mt-1 text-center font-bold">
                    Elige la asignatura sobre la cual vas a planificar en este momento.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Asignaturas Workspace */}
                  {selectedGrade && (
                    <div className="bg-slate-50/50 dark:bg-zinc-950/40 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 space-y-4">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#1e40af]" />
                        <h3 className="text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-widest">
                          Asignaturas para {getGradeById(selectedGrade)?.displayName.split(" (")[0]}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {filteredSubjects.map((subject) => {
                          const isSelected = selectedSubject?.id === subject.id;
                          const themeColor = subject.color || '#3b82f6';
                          
                          return (
                            <motion.button
                              key={subject.id}
                              type="button"
                              whileHover={{ scale: 1.025, y: -2 }}
                              whileTap={{ scale: 0.94 }}
                              transition={{ type: "spring", stiffness: 450, damping: 25 }}
                              onClick={() => {
                                setSelectedSubject(subject);
                                setSelectedSequence(null);
                              }}
                              className={`p-3.5 rounded-2xl border-2 transition-all duration-150 relative flex flex-col items-center justify-center gap-2 w-full h-[115px] cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-[#1e40af]/35 ${
                                isSelected
                                  ? 'border-[#1e40af] bg-[#1e40af]/5 ring-2 ring-[#1e40af]/15'
                                  : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                              }`}
                            >
                              {(() => {
                                const containerCls = `w-12 h-12 flex items-center justify-center text-[45px] shrink-0 transition-transform duration-300 ${
                                  isSelected ? 'scale-105' : ''
                                }`;

                                const emoji = (SUBJECT_EMOJIS as any)[selectedGrade]?.[subject.id];
                                if (emoji) {
                                  if (emoji === 'A') {
                                    return (
                                      <div className={`${containerCls} text-[#EF4444] font-sans font-black select-none`}>
                                        A
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className={`${containerCls} select-none`}>
                                      {emoji}
                                    </div>
                                  );
                                }

                                // Fallback
                                return (
                                  <div 
                                    className={`${containerCls} select-none`}
                                    style={{ color: themeColor }}
                                  >
                                    {subject.icon || '📘'}
                                  </div>
                                );
                              })()}
                              
                              <div className="w-full text-center">
                                <span className="text-[15px] font-black text-slate-800 dark:text-white leading-tight block">
                                  {subject.name}
                                </span>
                              </div>

                              {(() => {
                                const badgeText = getSubjectBadgeText(subject.id, selectedGrade);
                                const badgeCls = getSubjectBadgeClass(badgeText);
                                return (
                                  <span 
                                    className={`absolute top-3 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white transition-all duration-200 ${badgeCls} ${
                                      isSelected ? 'right-10' : 'right-3'
                                    }`}
                                  >
                                    {badgeText}
                                  </span>
                                );
                              })()}

                              {isSelected && (
                                <div 
                                  className="absolute top-3 right-3 rounded-full p-0.5 shadow-xs animate-in zoom-in duration-200 shrink-0 flex items-center justify-center w-5 h-5"
                                  style={{ backgroundColor: themeColor }}
                                >
                                  <Check className="w-3 h-3 text-white" strokeWidth={4} />
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Paso 3: Selección de Secuencia o Temas */}
            {currentStep === 3 && selectedSubject && (
              <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white text-center">
                    Secuencia Didáctica y Temas
                  </h2>
                  <p className="text-[13px] text-slate-555 dark:text-zinc-400 mt-1 text-center font-bold">
                    Elige la secuencia didáctica oficial o define el tema de la clase para la planificación de <span className="text-[#1e40af] dark:text-blue-400 text-[14.5px] font-black">{selectedSubject.name}</span>.
                  </p>
                </div>
                <div className="flex flex-col gap-6">
                  {isUnitBasedSubject && selectedSequenceType === 'CON_BASE' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {(() => {
                        const normalizedGrade = selectedGrade.replace(/^(primaria|secundaria|inicial)-/, '').trim();
                        const filteredCustom = customUnits
                          .filter(cu => cu.subject_id === selectedSubject?.id && cu.grade_id === normalizedGrade)
                          .map(cu => cu.content);

                        let mergedUnitsList = filteredCustom.filter(u => !u.isDeleted);

                        if (selectedSubject?.id === 'sociales' && normalizedGrade === '2do') {
                          const orderMap: Record<string, number> = {
                            'orientacion': 0,
                            'comunidad': 1,
                            'derechos': 2,
                            'eventos': 3
                          };
                          const getOrderKey = (name: string) => {
                            const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                            if (norm.includes('orientacion')) return 'orientacion';
                            if (norm.includes('comunidad')) return 'comunidad';
                            if (norm.includes('derechos')) return 'derechos';
                            if (norm.includes('evento')) return 'eventos';
                            return 'z-unknown';
                          };
                          mergedUnitsList.sort((a, b) => {
                            const keyA = getOrderKey(a.name);
                            const keyB = getOrderKey(b.name);
                            return (orderMap[keyA] ?? 99) - (orderMap[keyB] ?? 99);
                          });
                        }

                        return mergedUnitsList.map((unit, idx) => {
                          const isSelected = selectedSequence?.id === unit.id;
                          const unitColors = ['#1e40af', '#6366f1', '#ef4444', '#f59e0b', '#ec4899', '#10b981'];
                          const color = unitColors[idx % unitColors.length];
                          
                          return (
                            <motion.button
                              key={unit.id}
                              type="button"
                              whileHover={{ scale: 1.012 }}
                              whileTap={{ scale: 0.90 }}
                              transition={{ type: "spring", stiffness: 450, damping: 25 }}
                              onClick={() => {
                                setSelectedSequence(unit);
                                setSelectedTheme(null);
                                setSelectedSubtheme(null);
                              }}
                              className={`text-left transition-all duration-150 w-full focus:outline-none select-none cursor-pointer rounded-2xl p-5 border flex flex-col justify-start gap-2.5 min-h-[148px] h-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:border-[#1e40af]/30 ${
                                isSelected 
                                  ? 'border-[#1e40af] bg-[#1e40af]/5 ring-2 ring-[#1e40af]/15' 
                                  : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span
                                  className="px-2.5 py-1 rounded-full text-[9.5px] font-black text-white"
                                  style={{ backgroundColor: color }}
                                >
                                  {['3ro', '4to', '5to', '6to'].includes(normalizedGrade) &&
                                   ['sociales', 'naturales', 'educacion-artistica', 'educacion-fisica', 'formacion-humana'].includes(selectedSubject?.id || '')
                                    ? 'Secuencia Curricular'
                                    : (selectedPlanningType === 'UNIDAD' || ['1ro', '2do'].includes(normalizedGrade))
                                      ? 'Unidad Curricular'
                                      : `Unidad ${unit.week_duration ? `${unit.week_duration} semanas` : 'Curricular'}`}
                                </span>
                                {isSelected && <CheckCircle2 className="w-4.5 h-4.5 text-[#1e40af] shrink-0" />}
                              </div>
                              
                              <h4 className="text-[14.5px] font-black text-slate-800 dark:text-white leading-snug line-clamp-2">
                                {unit.name}
                              </h4>
                              
                              {(() => {
                                const allSubthemes = unit.themes?.flatMap((t: any) => t.subthemes || []) || [];
                                const firstThree = allSubthemes.slice(0, 3);
                                const remainingCount = allSubthemes.length - 3;

                                if (allSubthemes.length > 0) {
                                  return (
                                    <div className="mt-1 text-left space-y-0.5 text-[12px] text-slate-600 dark:text-zinc-400 font-normal">
                                      <span className="font-bold text-slate-700 dark:text-zinc-350 block mb-1">Conceptos principales:</span>
                                      <ul className="list-disc pl-4 space-y-1">
                                        {firstThree.map((sub: any) => (
                                          <li key={sub.id} className="truncate">{sub.name}</li>
                                        ))}
                                        {remainingCount > 0 && (
                                          <li className="text-[#1e40af] dark:text-blue-400 font-extrabold">
                                            +{remainingCount} más...
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  );
                                }

                                return (
                                  <p className="text-[11.5px] text-slate-555 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">
                                    {selectedSubject?.id === 'sociales' || selectedSubject?.id === 'naturales'
                                      ? `${unit.themes?.length || 0} temas curriculares definidos.`
                                      : (unit.description || `${unit.themes?.length || 0} temas curriculares definidos.`)}
                                  </p>
                                );
                              })()}
                            </motion.button>
                          );
                        });
                      })()}
                    </div>
                  ) : selectedSubject.id === 'lengua-espanola' && (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do' || selectedGrade === 'primaria-3ro' || selectedGrade === 'primaria-4to' || selectedGrade === 'primaria-5to' || selectedGrade === 'primaria-6to') && selectedPlanningType === 'DIARIA' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {(() => {
                        const sequences = selectedGrade === 'primaria-1ro'
                          ? LENGUA_1RO_SEQUENCES
                          : selectedGrade === 'primaria-2do'
                          ? LENGUA_2DO_SEQUENCES
                          : selectedGrade === 'primaria-3ro'
                          ? LENGUA_3RO_SEQUENCES
                          : Object.values(compiled2ndCycleSequences)
                              .filter((s: any) => s.grade_id === selectedGrade && s.subject_id?.startsWith('lengua-espanola'))
                              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                        return sequences.map(originalSeq => getSequenceData(originalSeq)).map((seq, idx) => {
                          const isSelected = selectedSequence?.id === seq.id;
                          const seqColors = ['#1e40af', '#6366f1', '#ef4444', '#f59e0b', '#ec4899', '#10b981'];
                          const color = seqColors[idx % seqColors.length];
                          
                          return (
                            <motion.button
                              key={seq.id}
                              type="button"
                              whileHover={{ scale: 1.012 }}
                              whileTap={{ scale: 0.90 }}
                              transition={{ type: "spring", stiffness: 450, damping: 25 }}
                              onClick={() => {
                                setLengSequenceIdx(idx);
                                setLengBlockIdx(0);
                                setLengActivityIdx(-1);
                                setSelectedSequence({
                                  id: seq.id,
                                  title: seq.title,
                                  intent: seq.description || seq.blocks?.[0]?.description || '',
                                  conceptual: seq.title,
                                  procedimental: '',
                                  actitudinal: '',
                                  evaluation: '',
                                  customMoments: [],
                                  customResources: [],
                                  homework: ''
                                });
                              }}
                              className={`text-left transition-all duration-150 w-full focus:outline-none select-none cursor-pointer rounded-2xl p-5 border flex flex-col justify-start gap-2.5 h-[148px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:border-[#1e40af]/30 ${
                                isSelected 
                                  ? 'border-[#1e40af] bg-[#1e40af]/5 ring-2 ring-[#1e40af]/15' 
                                  : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span
                                  className="px-2.5 py-1 rounded-full text-[9.5px] font-black text-white"
                                  style={{ backgroundColor: color }}
                                >
                                  Secuencia {seq.order !== undefined && seq.order !== '' ? seq.order : idx + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] text-slate-500 dark:text-zinc-400 font-extrabold">
                                    {seq.durationWeeks !== undefined && seq.durationWeeks !== '' ? seq.durationWeeks : 4} semanas
                                  </span>
                                  {isSelected && <CheckCircle2 className="w-4.5 h-4.5 text-[#1e40af] shrink-0" />}
                                </div>
                              </div>
                              
                              <h4 className="text-[14.5px] font-black text-slate-800 dark:text-white leading-snug">
                                {seq.title}
                              </h4>
                              
                              <p className="text-[11.5px] text-slate-550 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">
                                {seq.description || seq.blocks?.[0]?.description || 'Secuencia didáctica oficial MINERD.'}
                              </p>
                            </motion.button>
                          );
                        });
                      })()}
                    </div>
                  ) : selectedSubject.id === 'matematica' && (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do' || selectedGrade === 'primaria-3ro' || selectedGrade === 'primaria-4to' || selectedGrade === 'primaria-5to' || selectedGrade === 'primaria-6to') && selectedPlanningType === 'DIARIA' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {(() => {
                        const sequences = selectedGrade === 'primaria-1ro'
                          ? MATEMATICA_1RO_SEQUENCES
                          : selectedGrade === 'primaria-2do'
                          ? MATEMATICA_2DO_SEQUENCES
                          : selectedGrade === 'primaria-3ro'
                          ? MATEMATICA_3RO_SEQUENCES
                          : Object.values(compiled2ndCycleSequences)
                              .filter((s: any) => s.grade_id === selectedGrade && s.subject_id?.startsWith('matematica'))
                              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                        return sequences.map(originalSeq => getSequenceData(originalSeq)).map((seq, idx) => {
                          const isSelected = selectedSequence?.id === seq.id;
                          const seqColors = ['#1e40af', '#6366f1', '#ef4444', '#f59e0b', '#ec4899', '#10b981'];
                          const color = seqColors[idx % seqColors.length];
                          
                          return (
                            <motion.button
                              key={seq.id}
                              type="button"
                              whileHover={{ scale: 1.012 }}
                              whileTap={{ scale: 0.90 }}
                              transition={{ type: "spring", stiffness: 450, damping: 25 }}
                              onClick={() => {
                                setMatSequenceIdx(idx);
                                setMatBlockIdx(0);
                                setMatActivityIdx(-1);
                                setSelectedSequence({
                                  id: seq.id,
                                  title: seq.title,
                                  intent: seq.blocks?.[0]?.description || '',
                                  conceptual: seq.title,
                                  procedimental: '',
                                  actitudinal: '',
                                  evaluation: '',
                                  customMoments: [],
                                  customResources: [],
                                  homework: ''
                                });
                              }}
                              className={`text-left transition-all duration-150 w-full focus:outline-none select-none cursor-pointer rounded-2xl p-5 border flex flex-col justify-start gap-2.5 h-[148px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:border-[#1e40af]/30 ${
                                isSelected 
                                  ? 'border-[#1e40af] bg-[#1e40af]/5 ring-2 ring-[#1e40af]/15' 
                                  : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span
                                  className="px-2.5 py-1 rounded-full text-[9.5px] font-black text-white"
                                  style={{ backgroundColor: color }}
                                >
                                  Secuencia {seq.order !== undefined && seq.order !== '' ? seq.order : idx + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] text-slate-500 dark:text-zinc-400 font-extrabold">
                                    {seq.durationWeeks !== undefined && seq.durationWeeks !== '' ? seq.durationWeeks : 4} semanas
                                  </span>
                                  {isSelected && <CheckCircle2 className="w-4.5 h-4.5 text-[#1e40af] shrink-0" />}
                                </div>
                              </div>
                              
                              <h4 className="text-[14.5px] font-black text-slate-800 dark:text-white leading-snug">
                                {seq.title}
                              </h4>
                              
                              <p className="text-[11.5px] text-slate-550 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">
                                {seq.description || seq.blocks?.[0]?.description || 'Secuencia didáctica oficial MINERD.'}
                              </p>
                            </motion.button>
                          );
                        });
                      })()}
                    </div>
                  ) : activeSequences.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-80 overflow-y-auto pr-1">
                      {activeSequences.map((seq) => {
                        const isSelected = selectedSequence?.id === seq.id;
                        return (
                          <motion.button
                            key={seq.id}
                            type="button"
                            whileHover={{ scale: 1.012 }}
                            whileTap={{ scale: 0.90 }}
                            transition={{ type: "spring", stiffness: 450, damping: 25 }}
                            onClick={() => setSelectedSequence(seq)}
                            className={`p-5 border rounded-2xl transition-all duration-150 flex flex-col justify-start gap-2.5 text-left cursor-pointer h-[148px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-none hover:border-[#1e40af]/30 ${
                              isSelected
                                ? 'border-[#1e40af] bg-[#1e40af]/5 ring-2 ring-[#1e40af]/15'
                                : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-black text-white bg-slate-500">
                                Curricular
                              </span>
                              {isSelected && <CheckCircle2 className="w-4.5 h-4.5 text-[#1e40af] shrink-0" />}
                            </div>
                            
                            <h4 className="font-black text-[13.5px] text-slate-800 dark:text-white leading-snug">{seq.title}</h4>
                            
                            <p className="text-[11px] text-slate-550 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">{seq.intent}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2 max-w-md mx-auto w-full text-left">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider block">
                          Tema de la Clase
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Suma de fracciones, Comprensión lectora..."
                          value={classTopic}
                          onChange={(e) => setClassTopic(e.target.value)}
                          className="w-full h-11 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] outline-none transition-all shadow-sm font-semibold"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

        {/* Inactivo Step 2 */}
        {currentStep === 992 && selectedLevel && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 w-full max-w-5xl mx-auto">
            <div className="text-center mb-8 flex flex-col items-center justify-center gap-3">
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-0">
                Selecciona Ciclo y Grado
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                Paso 2 de 7 • {selectedLevel === 'INICIAL' ? 'Nivel Inicial' : selectedLevel === 'PRIMARIA' ? 'Nivel Primario' : 'Nivel Secundario'}
              </div>
            </div>

            {/* Selector de Ciclo */}
            <div className="mb-8 text-left">
              <h3 className="text-base font-extrabold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
                1. Selecciona el Ciclo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getCyclesByLevel(selectedLevel).map((cycle) => {
                  const isSelected = selectedCycle === cycle.id;
                  const levelColor = selectedLevel === 'INICIAL' ? '#FF6B9D' : selectedLevel === 'PRIMARIA' ? '#3b82f6' : '#8b5cf6';
                  
                  return (
                    <button
                      key={cycle.id}
                      onClick={() => {
                        setSelectedCycle(cycle.id);
                        setSelectedGrade('');
                      }}
                      className="group text-left relative focus:outline-none cursor-pointer w-full select-none"
                    >
                      <div
                        className={`transition-all duration-300 bg-white dark:bg-zinc-900 rounded-2xl p-5 relative ${
                          isSelected ? 'border-2 shadow-lg' : 'border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                        style={{
                          borderColor: isSelected ? levelColor : undefined
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-bold mb-1 transition-colors" style={{ color: isSelected ? levelColor : '#334155' }}>
                              {cycle.displayName}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
                              {cycle.grades.length} grados disponibles
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: levelColor }}>
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Grado */}
            {selectedCycle && (
              <div className="mb-8 text-left animate-in fade-in duration-200">
                <h3 className="text-base font-extrabold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
                  2. Selecciona el Grado
                </h3>
                <div className="flex flex-wrap gap-4">
                  {getGradesByCycle(selectedCycle).map((grade) => {
                    const isSelected = selectedGrade === grade.id;
                    const levelColor = selectedLevel === 'INICIAL' ? '#FF6B9D' : selectedLevel === 'PRIMARIA' ? '#3b82f6' : '#8b5cf6';
                    
                    return (
                      <button
                        key={grade.id}
                        onClick={() => setSelectedGrade(grade.id)}
                        className="group text-left focus:outline-none cursor-pointer w-48 select-none"
                      >
                        <div
                          className={`transition-all duration-300 bg-white dark:bg-zinc-900 rounded-xl p-4 text-center relative ${
                            isSelected ? 'border-2 shadow-lg scale-[1.02]' : 'border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700'
                          }`}
                          style={{
                            borderColor: isSelected ? levelColor : undefined
                          }}
                        >
                          <h4 className="text-base font-bold text-slate-800 dark:text-white mb-0.5">
                            {grade.displayName.split(' (')[0]}
                          </h4>
                          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: levelColor }}>
                            ({selectedLevel})
                          </p>
                          {isSelected && (
                            <div className="mt-2 flex justify-center" style={{ color: levelColor }}>
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resumen */}
            {selectedCycle && selectedGrade && (
              <div className="text-center mt-6">
                <div className="inline-block px-5 py-2.5 rounded-xl border border-dashed border-[#3b82f6]/30 bg-[#3b82f6]/5">
                  <p className="text-xs font-bold text-[#3b82f6] flex items-center gap-1.5 justify-center">
                    ✓ Selección completa: {selectedLevel} &gt; {getCycleById(selectedCycle)?.displayName} &gt; {getGradeById(selectedGrade)?.displayName}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inactivo Step 3 */}
        {currentStep === 993 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 w-full max-w-5xl mx-auto">
            <div className="text-center mb-8 flex flex-col items-center justify-center gap-3">
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-0">
                Selecciona el Tipo de Planificación
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                Paso 3 de 7 • Estrategia pedagógica
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {[
                {
                  id: 'DIARIA',
                  title: 'Planificación Diaria',
                  description: 'Planificación detallada clase a clase con momentos (Inicio, Desarrollo, Cierre).',
                  icon: '📅',
                  comingSoon: false
                },
                {
                  id: 'UNIDAD',
                  title: 'Unidad de Aprendizaje',
                  description: 'Planificación por bloque temático o unidad (3-6 semanas).',
                  icon: '📦',
                  comingSoon: false
                },
                {
                  id: 'ANUAL',
                  title: 'Planificación Anual',
                  description: 'Planificación curricular global con distribución para todo el año escolar completo.',
                  icon: '📆',
                  comingSoon: true
                }
              ].map((type) => {
                const isSelected = selectedPlanningType === type.id;
                const isDisabled = type.comingSoon;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => !isDisabled && setSelectedPlanningType(type.id)}
                    disabled={isDisabled}
                    className={`text-left transition-all duration-300 w-full relative focus:outline-none select-none cursor-pointer ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div
                      className={`h-full bg-white dark:bg-zinc-900 rounded-2xl p-6 relative flex flex-col justify-between min-h-[180px] ${
                        isSelected && !isDisabled 
                          ? 'border-2 border-[#3b82f6] shadow-lg scale-[1.02]' 
                          : 'border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="text-4xl mb-3">{type.icon}</div>
                        <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-2">{type.title}</h3>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold leading-relaxed">{type.description}</p>
                      </div>

                      {isDisabled && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-slate-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                            NO DISPONIBLE
                          </span>
                        </div>
                      )}

                      {selectedLevel === 'PRIMARIA' && type.id === 'UNIDAD' && (
                        <div className="mt-3 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50">
                          Soc., Nat. y Mat. (4to)
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Inactivo Step 4 */}
        {currentStep === 994 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 w-full max-w-5xl mx-auto">
            <div className="text-center mb-8 flex flex-col items-center justify-center gap-3">
              {/* Custom Header with Badge */}
              <div className="flex flex-col items-center justify-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-[#3b82f6] tracking-tight">
                  {selectedPlanningType === 'UNIDAD' ? 'Unidad de Aprendizaje' : 'Planificación Diaria'}
                </h1>
                {selectedGrade && (
                  <div className="px-5 py-2 rounded-full text-white font-bold text-xs bg-blue-600 shadow-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-white" /> {getGradeById(selectedGrade)?.displayName}
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-slate-850 dark:text-white mb-0">
                Selecciona una Asignatura
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                Paso 4 de 7 • Selección de asignatura
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {filteredSubjects.map((sub) => {
                const isSelected = selectedSubject?.id === sub.id;
                const isCurriculumOfficial = sub.curriculum_type === 'ADAPTACION_CURRICULAR';
                const label = isCurriculumOfficial ? 'Adecuación Curricular' : 'Con Base';
                const badgeClass = isCurriculumOfficial 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50' 
                  : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200/50';

                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub)}
                    className="text-left transition-all duration-300 w-full relative focus:outline-none select-none cursor-pointer"
                  >
                    <div
                      className={`h-full bg-white dark:bg-zinc-900 rounded-2xl p-6 flex items-start gap-4 ${
                        isSelected 
                          ? 'border-2 border-[#3b82f6] shadow-lg scale-[1.02]' 
                          : 'border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {(() => {
                        const is1ro = selectedGrade === 'primaria-1ro';
                        const is2do = selectedGrade === 'primaria-2do';
                        const is3ro = selectedGrade === 'primaria-3ro';
                        const containerCls = "w-16 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-md";

                        if (is1ro) {
                          if (sub.id === 'lengua-espanola') {
                            return (
                              <div className={`${containerCls} bg-[#EF4444] text-white font-sans font-black text-3xl select-none`}>
                                A
                              </div>
                            );
                          }
                          if (sub.id === 'matematica') {
                            return (
                              <div className={`${containerCls} bg-[#2563EB] text-white text-3xl select-none`}>
                                🧮
                              </div>
                            );
                          }
                          if (sub.id === 'sociales') {
                            return (
                              <div className={`${containerCls} bg-[#0EA5E9] text-white text-3xl select-none`}>
                                🗺️
                              </div>
                            );
                          }
                          if (sub.id === 'naturales') {
                            return (
                              <div className={`${containerCls} bg-[#22C55E] text-white text-3xl select-none`}>
                                🌱
                              </div>
                            );
                          }
                          if (sub.id === 'formacion-humana') {
                            return (
                              <div className={`${containerCls} bg-white border border-rose-200 dark:bg-zinc-800 dark:border-zinc-700 text-rose-500 text-3xl select-none`}>
                                💖
                              </div>
                            );
                          }
                          if (sub.id === 'educacion-artistica') {
                            return (
                              <div className={`${containerCls} bg-[#0D9488] text-white text-3xl select-none`}>
                                🎨
                              </div>
                            );
                          }
                          if (sub.id === 'educacion-fisica') {
                            return (
                              <div className={`${containerCls} bg-[#10B981] text-white text-3xl select-none`}>
                                🏃
                              </div>
                            );
                          }
                        }

                        if (is2do) {
                          if (sub.id === 'lengua-espanola') {
                            return (
                              <div className={`${containerCls} bg-[#EF4444] text-white text-3xl select-none`}>
                                📒
                              </div>
                            );
                          }
                          if (sub.id === 'matematica') {
                            return (
                              <div className={`${containerCls} bg-[#2563EB] text-white text-3xl select-none`}>
                                🔢
                              </div>
                            );
                          }
                          if (sub.id === 'sociales') {
                            return (
                              <div className={`${containerCls} bg-[#0EA5E9] text-white text-3xl select-none`}>
                                🏛️
                              </div>
                            );
                          }
                          if (sub.id === 'naturales') {
                            return (
                              <div className={`${containerCls} bg-[#22C55E] text-white text-3xl select-none`}>
                                🌿
                              </div>
                            );
                          }
                          if (sub.id === 'formacion-humana') {
                            return (
                              <div className={`${containerCls} bg-white border border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 text-amber-500 text-3xl select-none`}>
                                🙏
                              </div>
                            );
                          }
                          if (sub.id === 'educacion-artistica') {
                            return (
                              <div className={`${containerCls} bg-[#0D9488] text-white text-3xl select-none`}>
                                🖌️
                              </div>
                            );
                          }
                          if (sub.id === 'educacion-fisica') {
                            return (
                              <div className={`${containerCls} bg-[#10B981] text-white text-3xl select-none`}>
                                🎾
                              </div>
                            );
                          }
                        }

                        if (is3ro) {
                          if (sub.id === 'lengua-espanola') {
                            return (
                              <div className={`${containerCls} bg-[#EF4444] text-white text-3xl select-none`}>
                                ✍️
                              </div>
                            );
                          }
                          if (sub.id === 'matematica') {
                            return (
                              <div className={`${containerCls} bg-[#2563EB] text-white text-3xl select-none`}>
                                ➗
                              </div>
                            );
                          }
                          if (sub.id === 'sociales') {
                            return (
                              <div className={`${containerCls} bg-[#0EA5E9] text-white text-3xl select-none`}>
                                🧭
                              </div>
                            );
                          }
                          if (sub.id === 'naturales') {
                            return (
                              <div className={`${containerCls} bg-[#22C55E] text-white text-3xl select-none`}>
                                🦠
                              </div>
                            );
                          }
                          if (sub.id === 'formacion-humana') {
                            return (
                              <div className={`${containerCls} bg-white border border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 text-slate-500 text-3xl select-none`}>
                                🕊️
                              </div>
                            );
                          }
                          if (sub.id === 'educacion-artistica') {
                            return (
                              <div className={`${containerCls} bg-[#0D9488] text-white text-3xl select-none`}>
                                🎭
                              </div>
                            );
                          }
                          if (sub.id === 'educacion-fisica') {
                            return (
                              <div className={`${containerCls} bg-[#10B981] text-white text-3xl select-none`}>
                                🏀
                              </div>
                            );
                          }
                        }

                        return (
                          <div
                            className="text-4xl w-16 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br"
                            style={{
                              backgroundColor: `${sub.color}15`,
                              color: sub.color
                            }}
                          >
                            {sub.icon || '📘'}
                          </div>
                        );
                      })()}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold mb-3 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${badgeClass}`}>
                          {label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredSubjects.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
                  No hay asignaturas disponibles registradas para este grado y nivel.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Inactivo Step 5 */}
        {currentStep === 995 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-4xl mx-auto w-full">
            <div className="text-center mb-6 flex flex-col items-center justify-center gap-3">
              {/* Custom Header with Badge */}
              <div className="flex flex-col items-center justify-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-[#3b82f6] tracking-tight">
                  {selectedPlanningType === 'UNIDAD' ? 'Unidad de Aprendizaje' : 'Planificación Diaria'}
                </h1>
                {selectedGrade && (
                  <div className="px-5 py-2 rounded-full text-white font-bold text-xs bg-blue-600 shadow-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-white" /> {getGradeById(selectedGrade)?.displayName}
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-slate-850 dark:text-white mb-0">
                Selecciona la Secuencia Didáctica
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                Paso 5 de 7 • Secuencia didáctica oficial
              </div>
            </div>

            {selectedSequenceType === 'CON_BASE' ? (
              selectedSubject?.id === 'lengua-espanola' && (selectedGrade === 'primaria-1ro' || selectedGrade === 'primaria-2do' || selectedGrade === 'primaria-3ro') && selectedPlanningType === 'DIARIA' ? (
                <div className="space-y-6 pt-2">
                  <p className="text-xs text-slate-400 dark:text-zinc-500 text-center font-bold">
                    Selecciona una de las 6 secuencias didácticas oficiales de Lengua Española:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {(() => {
                      const sequences = selectedGrade === 'primaria-1ro'
                        ? LENGUA_1RO_SEQUENCES
                        : selectedGrade === 'primaria-2do'
                        ? LENGUA_2DO_SEQUENCES
                        : LENGUA_3RO_SEQUENCES;
                      return sequences.map(originalSeq => getSequenceData(originalSeq)).map((seq, idx) => {
                        const seqColors = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899', '#10b981'];
                        const color = seqColors[idx % seqColors.length];
                        return (
                          <button
                            key={seq.id}
                            onClick={() => {
                              setLengSequenceIdx(idx);
                              setLengBlockIdx(0);
                              setLengActivityIdx(-1);
                              setSelectedSequence({
                                id: seq.id,
                                title: seq.title,
                                intent: seq.blocks?.[0]?.description || '',
                                conceptual: seq.title,
                                procedimental: '',
                                actitudinal: '',
                                evaluation: '',
                                customMoments: [],
                                customResources: [],
                                homework: ''
                              });
                              setCurrentStep(7);
                            }}
                            className="text-left transition-all duration-200 w-full focus:outline-none select-none cursor-pointer group"
                          >
                            <div className="h-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-zinc-700 transition-all group-hover:scale-[1.02]">
                              <div className="flex items-start justify-between mb-3">
                                <span
                                  className="inline-block px-3 py-1 rounded-full text-[10px] font-black text-white shadow-xs"
                                  style={{ backgroundColor: color }}
                                >
                                  Secuencia {seq.order !== undefined && seq.order !== '' ? seq.order : idx + 1}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold">
                                  {seq.durationWeeks !== undefined && seq.durationWeeks !== '' ? seq.durationWeeks : 4} semanas
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
                                {seq.title.charAt(0).toUpperCase() + seq.title.slice(1).toLowerCase()}
                              </h3>
                              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium line-clamp-2 leading-relaxed">
                                {seq.description || seq.blocks?.[0]?.description || 'Secuencia didáctica oficial MINERD.'}
                              </p>
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-slate-400 dark:text-zinc-500 text-center font-bold">
                    Selecciona una de las secuencias de aprendizaje oficiales registradas para {selectedSubject?.name}:
                  </p>
                  <div className="space-y-3 max-w-2xl mx-auto max-h-64 overflow-y-auto pr-1">
                    {activeSequences.map((seq) => {
                      const isSelected = selectedSequence?.id === seq.id;
                      return (
                        <button
                          key={seq.id}
                          onClick={() => setSelectedSequence(seq)}
                          className="w-full text-left focus:outline-none select-none cursor-pointer"
                        >
                          <div
                            className={`p-4 border rounded-[16px] transition-all flex items-center justify-between ${
                              isSelected
                                ? 'border-[#3b82f6] bg-[#3b82f6]/5 dark:bg-zinc-800'
                                : 'border-slate-200 dark:border-zinc-800 hover:border-slate-355 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/40'
                            }`}
                          >
                            <div>
                              <h4 className="font-extrabold text-xs text-slate-800 dark:text-white">{seq.title}</h4>
                              <p className="text-[10.5px] text-slate-400 dark:text-zinc-500 mt-1 max-w-[550px] truncate">{seq.intent}</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[#3b82f6] bg-[#3b82f6]' : 'border-slate-300 dark:border-zinc-700'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {activeSequences.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500 font-bold border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                        No hay secuencias específicas para esta asignatura. Usa la Adecuación Curricular libre.
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-4 max-w-md mx-auto pt-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                    Tema Curricular / Eje Temático
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Suma de fracciones, Comprensión lectora..."
                    value={classTopic}
                    onChange={(e) => setClassTopic(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all shadow-sm font-semibold"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-normal font-medium">
                  Introduce el tema central de la sesión. El sistema configurará las plantillas y prompts de la IA en función de esta entrada.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Paso 3.5: Selección de Tema y Subtema (Asignaturas basadas en Unidades como Ciencias Sociales) */}
        {currentStep === 3.5 && selectedSequence && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white text-center">
                Selección de Tema y Subtema
              </h2>
              <p className="text-[13px] text-slate-550 dark:text-zinc-400 mt-1 text-center font-bold">
                Elige un tema curricular y un subtema específico de la unidad: <span className="text-[#1e40af] dark:text-indigo-400">{selectedSequence.name}</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-indigo-50/70 dark:from-indigo-950/15 dark:via-purple-950/5 dark:to-indigo-950/15 p-4.5 rounded-2xl border border-indigo-150/60 dark:border-indigo-900/30 shadow-[0_4px_20px_rgba(99,102,241,0.02)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.05)] transition-all duration-300 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-500/10 dark:bg-indigo-950/40 rounded-full flex items-center justify-center shrink-0 text-indigo-650 dark:text-indigo-400">
                  <Lightbulb className="w-4 h-4 fill-indigo-500/20 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-xs text-slate-700 dark:text-zinc-300 font-extrabold text-center sm:text-left">
                  ¿No encuentras el tema que necesitas? <span className="text-indigo-600 dark:text-indigo-400 font-bold block sm:inline sm:ml-1 text-[11px]">(Usa nuestro sugeridor inteligente)</span>
                </div>
              </div>
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setAiPrompt('');
                  setAiSuggestions([]);
                  setIsAiOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-655 text-white font-black text-xs transition-all cursor-pointer shadow-md hover:shadow-lg"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sugerir temas con IA
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda: Temas */}
              <div className="bg-slate-50/50 dark:bg-zinc-950/40 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 fill-indigo-500/20 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-widest">
                    Temas Definidos
                  </h3>
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {(!selectedSequence.themes || selectedSequence.themes.length === 0) ? (
                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold py-6 text-center">
                      No hay temas definidos para esta unidad.
                    </p>
                  ) : (
                    selectedSequence.themes.map((theme: any) => {
                      const isSelected = selectedTheme?.id === theme.id;
                      const primaryColor = selectedSubject?.color || '#3B82F6';
                      return (
                        <motion.button
                          key={theme.id}
                          type="button"
                          whileHover={{ y: -1.5 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            setSelectedTheme(theme);
                            setSelectedSubtheme(null);
                          }}
                          className={`text-left p-3.5 rounded-xl border transition-all duration-200 w-full flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_24px_rgba(148,163,184,0.12)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] cursor-pointer group ${
                            isSelected
                              ? ''
                              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-350 dark:hover:border-zinc-700'
                          }`}
                          style={isSelected ? {
                            borderColor: primaryColor,
                            backgroundColor: `${primaryColor}0A`,
                            boxShadow: `0 0 0 1px ${primaryColor}26`
                          } : {}}
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[13px] font-black text-slate-800 dark:text-white leading-snug">
                              {theme.name}
                            </span>
                            <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: primaryColor }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                              {theme.subthemes?.length || 0} subtemas personalizados
                            </span>
                          </div>
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-350 dark:text-zinc-650 group-hover:translate-x-0.5 transition-transform shrink-0" />
                          )}
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Columna Derecha: Subtemas */}
              <div className="bg-slate-50/50 dark:bg-zinc-950/40 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${selectedSubject?.color || '#3B82F6'}1A` }}>
                    <BookOpen className="w-4 h-4" style={{ color: selectedSubject?.color || '#3B82F6', fill: `${selectedSubject?.color || '#3B82F6'}20` }} />
                  </div>
                  <h3 className="text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-widest">
                    Subtemas
                  </h3>
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {!selectedTheme ? (
                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold py-12 text-center">
                      Selecciona un tema para ver sus subtemas.
                    </p>
                  ) : (!selectedTheme.subthemes || selectedTheme.subthemes.length === 0) ? (
                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold py-6 text-center">
                      No hay subtemas definidos para este tema.
                    </p>
                  ) : (
                    selectedTheme.subthemes.map((subtheme: any) => {
                      const isSelected = selectedSubtheme?.id === subtheme.id;
                      const primaryColor = selectedSubject?.color || '#3B82F6';
                      return (
                        <motion.button
                          key={subtheme.id}
                          type="button"
                          whileHover={{ y: -1.5 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            setSelectedSubtheme(subtheme);
                          }}
                          className={`text-left p-3.5 rounded-xl border transition-all duration-200 w-full flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_24px_rgba(148,163,184,0.12)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] cursor-pointer ${
                            isSelected
                              ? ''
                              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-350 dark:hover:border-zinc-700'
                          }`}
                          style={isSelected ? {
                            borderColor: primaryColor,
                            backgroundColor: `${primaryColor}0A`,
                            boxShadow: `0 0 0 1px ${primaryColor}26`
                          } : {}}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div 
                              className="w-6 h-6 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 text-white"
                              style={{ backgroundColor: primaryColor }}
                            >
                              ST
                            </div>
                            <span className="text-[12.5px] font-extrabold text-slate-800 dark:text-white leading-snug">
                              {subtheme.name}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />}
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* AI suggestion Modal */}
            {isAiOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in cursor-pointer" onClick={() => { setIsAiOpen(false); setAiSuggestions([]); setAiPrompt(''); }}>
                <div 
                  className={`bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl ${isGenerating ? 'max-w-[380px]' : 'max-w-lg'} w-full flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 cursor-default`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center p-8 pt-10 pb-7 text-center relative animate-in fade-in duration-300">
                      <button
                        type="button"
                        onClick={() => {
                          setIsGenerating(false);
                          setIsAiOpen(false);
                          setAiSuggestions([]);
                          setAiPrompt('');
                        }}
                        className="absolute top-4 right-4 h-6 w-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-xs"
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
                          Diseñando temas
                        </h4>
                        <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                          Redactando sugerencias de temas y subtemas. Esto puede tomar unos segundos.
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
                  ) : (
                    <>
                      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shrink-0">
                            <Sparkles className="w-4.5 h-4.5 fill-indigo-500/20 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <h3 className="text-base font-black text-slate-800 dark:text-white">
                            Sugeridor de Temas con IA
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAiOpen(false);
                            setAiSuggestions([]);
                            setAiPrompt('');
                          }}
                          className="h-6 w-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                          title="Cerrar"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                            ¿Cuál es tu enfoque pedagógico? (Opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Enfoque en la geografía local, historia familiar..."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleGenerateAiThemes();
                              }
                            }}
                            className="w-full h-11 px-3.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-[#1B1B1B] dark:text-neutral-100 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all shadow-xs"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isGenerating}
                          onClick={handleGenerateAiThemes}
                          className="w-full h-11 bg-indigo-600 hover:bg-indigo-750 disabled:bg-indigo-400 text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          Generar Sugerencias con IA
                        </button>

                        {aiSuggestions.length > 0 && (
                          <div className="space-y-3 pt-3">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 pl-1">
                              Sugerencias Generadas (Elige una para aplicar)
                            </div>
                            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                              {aiSuggestions.map((sug, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden"
                                >
                                  <div className="bg-indigo-50/40 dark:bg-indigo-950/20 px-4 py-3 border-b border-slate-100 dark:border-zinc-850 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <span className="font-extrabold text-[12px] text-slate-800 dark:text-slate-205 leading-snug">
                                      Tema: {sug.name}
                                    </span>
                                  </div>
                                  <div className="p-3 space-y-2 bg-slate-50/5 dark:bg-zinc-950/5">
                                    {sug.subthemes.map((sub, subIdx) => (
                                      <motion.button
                                        key={subIdx}
                                        type="button"
                                        whileHover={{ x: 3 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => handleApplyAiTheme(sug.name, sub, sug.subthemes)}
                                        className="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-indigo-400 dark:hover:border-zinc-700 hover:bg-indigo-50/30 hover:text-indigo-700 transition-all text-left flex items-center justify-between gap-3 w-full cursor-pointer shadow-3xs hover:shadow-2xs"
                                      >
                                        <span className="leading-relaxed">{sub}</span>
                                        <div className="w-5.5 h-5.5 rounded-lg bg-indigo-500/5 dark:bg-indigo-950/50 flex items-center justify-center shrink-0 border border-indigo-100/40 dark:border-indigo-900/30 text-indigo-650 dark:text-indigo-400">
                                          <Plus className="w-3.5 h-3.5" />
                                        </div>
                                      </motion.button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inactivo Step 6 */}
        {currentStep === 996 && (
          <div className="space-y-5 max-w-xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="text-center mb-6 flex flex-col items-center justify-center gap-3">
              <h2 className="text-2xl font-bold text-slate-850 dark:text-white mb-0">
                Detalles Iniciales del Plan
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                Paso 6 de 7 • Parámetros generales
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Título de la Planificación</label>
                <input
                  type="text"
                  placeholder="Ej: Plan Diario: Comprensión del letrero escolar"
                  value={classTitle}
                  onChange={(e) => setClassTitle(e.target.value)}
                  className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Intención Pedagógica del día</label>
                <textarea
                  placeholder="Ej: Lograr que los alumnos entiendan las estructuras del diálogo..."
                  value={pedagogicalIntent}
                  onChange={(e) => setPedagogicalIntent(e.target.value)}
                  className="w-full h-24 p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Contexto o sugerencias para la IA (Opcional)</label>
                <textarea
                  placeholder="Ej: Los estudiantes tienen dificultades para concentrarse. Prefieren actividades kinestésicas..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  className="w-full h-20 p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Paso 4: Editor de Plan (Dynamic daily form editor) */}
        {currentStep === 4 && (
          isLoadingForm ? (() => {
            const currentIconData = LOADING_ICONS[loaderIconIndex];
            const SubjectIcon = currentIconData.icon;
            const loadingTexts = [
              "Cargando Formulario...",
              "Estructurando competencias específicas y fundamentales...",
              `Cargando secuencias de ${selectedSubject?.name || "Asignatura"}...`,
              "Estamos preparando tu entorno de planificación personalizada."
            ];
            return (
              <div className="fixed inset-0 z-40 bg-bg-base text-[#1B1B1B] dark:text-zinc-150 flex flex-col items-center justify-center select-none text-center p-6">
                <div className="flex flex-col items-center justify-center max-w-xl w-full mx-auto animate-in fade-in duration-300">
                  <div className="relative flex items-center justify-center w-20 h-20 mb-5">
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-slate-205 dark:border-zinc-800" />
                    <div className={`absolute inset-0 rounded-full border-4 ${currentIconData.ringClass} border-t-transparent border-r-transparent animate-spin`} style={{ animationDuration: '0.9s' }} />
                    
                    {/* Glowing aura */}
                    <div className={`absolute w-16 h-16 rounded-full ${currentIconData.auraClass} blur-xl animate-pulse`} />
                    
                    {/* Inner icon container with a soft pulse */}
                    <div className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-sm border transition-all duration-300 ${currentIconData.colorClass}`}>
                      <SubjectIcon className="w-6.5 h-6.5" />
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight animate-pulse">
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
                      className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-full"
                    />
                  </div>
                </div>
              </div>
            );
          })() : (
            selectedSubject?.id === 'lengua-espanola' && selectedGrade === 'primaria-1ro' && selectedPlanningType === 'DIARIA' ? (
            <LenguaEspañola
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              lengSequenceIdx={lengSequenceIdx}
              lengBlockIdx={lengBlockIdx}
              lengActivityIdx={lengActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={(customFieldsData) => {
                const resolvedTitle = customFieldsData.actividad_titulo || `Plan Diario: ${customFieldsData.secuencia}`;
                const resolvedIntent = customFieldsData.intencion_pedagogica;
                const resolvedResources = customFieldsData.momentos.flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
                const resolvedMomentos = {
                  inicio: customFieldsData.momentos[0]?.descripcion || '',
                  desarrollo: customFieldsData.momentos[1]?.descripcion || '',
                  cierre: customFieldsData.momentos[2]?.descripcion || ''
                };
                const resolvedTarea = customFieldsData.tarea_hogar;
                const resolvedEvaluation = customFieldsData.evaluacion;

                const planData: LessonPlan = {
                  id: uid('plan'),
                  docente_id: user.id,
                  titulo: resolvedTitle,
                  tipo: selectedSequenceType,
                  nivel: selectedLevel?.toLowerCase() as any,
                  grado: selectedGrade,
                  asignatura: selectedSubject?.name || 'Asignatura',
                  secuencia_id: selectedSequence?.id,
                  bloque_id: customFieldsData.bloque,
                  actividad_id: customFieldsData.actividad_id,
                  intencion_pedagogica: resolvedIntent,
                  recursos: resolvedResources,
                  momentos: resolvedMomentos,
                  tarea: resolvedTarea,
                  conceptual: customFieldsData.secuencia,
                  procedimental: customFieldsData.momentos.map((m: any) => m.descripcion).join('\n\n'),
                  actitudinal: 'Disposición al diálogo y respeto.',
                  evaluacion: resolvedEvaluation,
                  creado_en: new Date().toISOString(),
                  customFields: customFieldsData
                };

                saveLessonPlan(planData);
                confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
                toast.success('¡Planificación guardada!');
                navigateToPlanificaciones(1500);
              }}
            />
          ) : selectedSubject?.id === 'matematica' && selectedGrade === 'primaria-1ro' && selectedPlanningType === 'DIARIA' ? (
            <Matematica
              user={user}
              selectedSequence={selectedSequence}
              selectedSequenceType={selectedSequenceType}
              selectedLevel={selectedLevel}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedPlanningType={selectedPlanningType}
              matSequenceIdx={matSequenceIdx}
              matBlockIdx={matBlockIdx}
              matActivityIdx={matActivityIdx}
              onBack={handleBack}
              onCancel={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              onSave={(customFieldsData) => {
                const resolvedTitle = customFieldsData.actividad_titulo || `Plan Diario: ${customFieldsData.secuencia}`;
                const resolvedIntent = customFieldsData.intencion_pedagogica;
                const resolvedResources = customFieldsData.momentos.flatMap((m: any) => (m.recursos || '').split(',').map((r: string) => r.trim()));
                const resolvedMomentos = {
                  inicio: customFieldsData.momentos[0]?.descripcion || '',
                  desarrollo: customFieldsData.momentos[1]?.descripcion || '',
                  cierre: customFieldsData.momentos[2]?.descripcion || ''
                };
                const resolvedTarea = customFieldsData.tarea_hogar;
                const resolvedEvaluation = customFieldsData.evaluacion;

                const planData: LessonPlan = {
                  id: uid('plan'),
                  docente_id: user.id,
                  titulo: resolvedTitle,
                  tipo: selectedSequenceType,
                  nivel: selectedLevel?.toLowerCase() as any,
                  grado: selectedGrade,
                  asignatura: selectedSubject?.name || 'Asignatura',
                  secuencia_id: selectedSequence?.id,
                  bloque_id: customFieldsData.bloque,
                  actividad_id: customFieldsData.actividad_id,
                  intencion_pedagogica: resolvedIntent,
                  recursos: resolvedResources,
                  momentos: resolvedMomentos,
                  tarea: resolvedTarea,
                  conceptual: customFieldsData.secuencia,
                  procedimental: customFieldsData.momentos.map((m: any) => m.descripcion).join('\n\n'),
                  actitudinal: 'Curiosidad y rigor matemático.',
                  evaluacion: resolvedEvaluation,
                  creado_en: new Date().toISOString(),
                  customFields: customFieldsData
                };

                saveLessonPlan(planData);
                confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
                toast.success('¡Planificación guardada!');
                navigateToPlanificaciones(1500);
              }}
            />
          ) : (
            <div className="space-y-6 text-left">
            
            {/* Header info bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-zinc-900/30 rounded-2xl border border-black/5 dark:border-zinc-800/80 mb-6 select-none">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-black uppercase bg-indigo-500 text-white px-2.5 py-1 rounded-full shadow-xs">
                  {selectedLevel}
                </span>
                <span className="text-[10px] font-black uppercase bg-purple-500 text-white px-2.5 py-1 rounded-full shadow-xs">
                  {selectedGrade}
                </span>
                <span className="text-[10px] font-black uppercase bg-[#1B1B1B] dark:bg-white text-white dark:text-black px-2.5 py-1 rounded-full shadow-xs">
                  {selectedSubject?.name}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  className="bg-amber-500 hover:bg-amber-600 text-white border-none text-xs font-bold px-4 py-2 rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  {isGeneratingAI ? 'Redactando con IA...' : 'Completar con IA'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowInclusionModal(true)}
                  className="bg-sky-500 hover:bg-sky-600 text-white border-none text-xs font-bold px-4 py-2 rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none"
                >
                  <Heart size={13} />
                  Adaptación / Inclusión
                </button>

                <button
                  type="button"
                  onClick={handleGenerateRubric}
                  disabled={isGeneratingRubric}
                  className="bg-purple-600 hover:bg-purple-700 text-white border-none text-xs font-bold px-4 py-2 rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none disabled:opacity-50"
                >
                  <Award size={13} />
                  Añadir Rúbrica
                </button>
              </div>
            </div>

            {/* Daily Class Form Fields */}
            {customFormSchema ? (
              <div className="grid grid-cols-12 gap-5 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-3xl p-6 w-full">
                {customFormSchema.fields.map((field: any) => {
                  const colSpanMap = {
                    '25': 'col-span-12 md:col-span-3',
                    '33': 'col-span-12 md:col-span-4',
                    '50': 'col-span-12 md:col-span-6',
                    '100': 'col-span-12'
                  };
                  const colSpan = colSpanMap[field.width as '25' | '33' | '50' | '100'] || 'col-span-12';
                  
                  return (
                    <div key={field.id} className={`${colSpan} space-y-1.5`}>
                      <div className="flex items-center gap-1">
                        <label className="text-[11px] font-extrabold text-slate-655 dark:text-zinc-400 uppercase tracking-wider block text-left">
                          {field.label}
                        </label>
                        {field.required && <span className="text-red-500 font-bold">*</span>}
                      </div>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.placeholder || ''}
                          value={customFieldsData[field.id] || ''}
                          onChange={(e) => setCustomFieldsData({ ...customFieldsData, [field.id]: e.target.value })}
                          className="w-full h-10 px-3.5 bg-white dark:bg-zinc-955 border border-neutral-205 dark:border-zinc-850 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 focus:border-[#0046ab] focus:ring-2 focus:ring-[#0046ab]/15 outline-none transition-all shadow-xs"
                          required={field.required}
                        />
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          placeholder={field.placeholder || ''}
                          value={customFieldsData[field.id] || ''}
                          onChange={(e) => setCustomFieldsData({ ...customFieldsData, [field.id]: e.target.value })}
                          rows={4}
                          className="w-full p-3 bg-white dark:bg-zinc-955 border border-neutral-205 dark:border-zinc-850 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 focus:border-[#0046ab] focus:ring-2 focus:ring-[#0046ab]/15 outline-none transition-all shadow-xs resize-none"
                          required={field.required}
                        />
                      )}

                      {field.type === 'richtext' && (
                        <textarea
                          placeholder={field.placeholder || ''}
                          value={customFieldsData[field.id] || ''}
                          onChange={(e) => setCustomFieldsData({ ...customFieldsData, [field.id]: e.target.value })}
                          rows={5}
                          className="w-full p-3 font-mono text-xs bg-white dark:bg-zinc-955 border border-neutral-205 dark:border-zinc-850 rounded-lg text-[#1B1B1B] dark:text-neutral-100 focus:border-[#0046ab] focus:ring-2 focus:ring-[#0046ab]/15 outline-none transition-all shadow-xs resize-none"
                          required={field.required}
                        />
                      )}

                      {field.type === 'select' && (
                        <select
                          value={customFieldsData[field.id] || ''}
                          onChange={(e) => setCustomFieldsData({ ...customFieldsData, [field.id]: e.target.value })}
                          className="w-full h-10 px-3 bg-white dark:bg-zinc-955 border border-neutral-205 dark:border-zinc-850 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 focus:border-[#0046ab] focus:ring-2 focus:ring-[#0046ab]/15 outline-none transition-all shadow-xs"
                          required={field.required}
                        >
                          <option value="">Seleccionar...</option>
                          {field.options?.map((opt: string, oIdx: number) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}

                      {field.type === 'competencias' && (
                        <div className="p-4 bg-slate-50 dark:bg-zinc-955 border border-slate-150/60 dark:border-zinc-850 rounded-2xl space-y-2 text-left">
                          {['Competencia Comunicativa', 'Competencia de Pensamiento Lógico, Creativo y Crítico', 'Competencia de Resolución de Problemas', 'Competencia Científica y Tecnológica', 'Competencia Ambiental y de la Salud', 'Competencia Desarrollo Personal y Espiritual', 'Competencia Ética y Ciudadana'].map((comp, cIdx) => {
                            const currentList = customFieldsData[field.id] || [];
                            const isChecked = currentList.includes(comp);
                            return (
                              <label key={cIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-350 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const nextList = e.target.checked 
                                      ? [...currentList, comp]
                                      : currentList.filter((c: string) => c !== comp);
                                    setCustomFieldsData({ ...customFieldsData, [field.id]: nextList });
                                  }}
                                  className="w-4 h-4 text-[#0046ab] border-slate-300 rounded focus:ring-[#0046ab]"
                                />
                                {comp}
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {field.type === 'momentos' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-100 dark:border-zinc-850 rounded-2xl p-4 bg-slate-50/50 dark:bg-zinc-950/20 text-left">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-sky-500 uppercase">Inicio (15 min)</span>
                            <textarea
                              value={customFieldsData[field.id]?.inicio || ''}
                              onChange={(e) => setCustomFieldsData({ 
                                ...customFieldsData, 
                                [field.id]: { ...(customFieldsData[field.id] || {}), inicio: e.target.value } 
                              })}
                              rows={4}
                              className="w-full p-2 bg-white dark:bg-zinc-955 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs resize-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-amber-500 uppercase">Desarrollo (45 min)</span>
                            <textarea
                              value={customFieldsData[field.id]?.desarrollo || ''}
                              onChange={(e) => setCustomFieldsData({ 
                                ...customFieldsData, 
                                [field.id]: { ...(customFieldsData[field.id] || {}), desarrollo: e.target.value } 
                              })}
                              rows={4}
                              className="w-full p-2 bg-white dark:bg-zinc-955 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs resize-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-emerald-500 uppercase">Cierre (10 min)</span>
                            <textarea
                              value={customFieldsData[field.id]?.cierre || ''}
                              onChange={(e) => setCustomFieldsData({ 
                                ...customFieldsData, 
                                [field.id]: { ...(customFieldsData[field.id] || {}), cierre: e.target.value } 
                              })}
                              rows={4}
                              className="w-full p-2 bg-white dark:bg-zinc-955 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs resize-none"
                            />
                          </div>
                        </div>
                      )}

                      {field.type === 'evaluacion_metacognicion' && (
                        <textarea
                          placeholder="Indicadores de logro, criterios y preguntas metacognitivas..."
                          value={customFieldsData[field.id] || ''}
                          onChange={(e) => setCustomFieldsData({ ...customFieldsData, [field.id]: e.target.value })}
                          rows={4}
                          className="w-full p-3 bg-white dark:bg-zinc-955 border border-neutral-200 dark:border-zinc-850 rounded-xl text-xs resize-none"
                        />
                      )}

                      {field.type === 'tarea_hogar' && (
                        <textarea
                          placeholder="Asignar tarea..."
                          value={customFieldsData[field.id] || ''}
                          onChange={(e) => setCustomFieldsData({ ...customFieldsData, [field.id]: e.target.value })}
                          rows={2}
                          className="w-full p-3 bg-white dark:bg-zinc-955 border border-neutral-200 dark:border-zinc-850 rounded-xl text-xs resize-none"
                        />
                      )}

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left double column: Core Fields */}
              <div className="lg:col-span-2 space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Título del Plan diario</label>
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Intención Pedagógica</label>
                  <textarea
                    value={editorIntent}
                    onChange={(e) => setEditorIntent(e.target.value)}
                    className="w-full h-20 p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs resize-none"
                  />
                </div>

                {/* Moments of the class */}
                <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
                  <span className="text-[10.5px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Momentos del Plan Diario</span>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10.5px] font-bold uppercase text-slate-400">
                        <span>Inicio de Clase</span>
                        <span className="text-sky-500">10-15 Minutos</span>
                      </div>
                      <textarea
                        value={editorMomentos.inicio}
                        onChange={(e) => setEditorMomentos({ ...editorMomentos, inicio: e.target.value })}
                        className="w-full h-24 p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-xs text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10.5px] font-bold uppercase text-slate-400">
                        <span>Desarrollo de Actividades</span>
                        <span className="text-amber-500">30-45 Minutos</span>
                      </div>
                      <textarea
                        value={editorMomentos.desarrollo}
                        onChange={(e) => setEditorMomentos({ ...editorMomentos, desarrollo: e.target.value })}
                        className="w-full h-32 p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-xs text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10.5px] font-bold uppercase text-slate-400">
                        <span>Cierre de Clase / Metacognición</span>
                        <span className="text-emerald-500">5-10 Minutos</span>
                      </div>
                      <textarea
                        value={editorMomentos.cierre}
                        onChange={(e) => setEditorMomentos({ ...editorMomentos, cierre: e.target.value })}
                        className="w-full h-24 p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-xs text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: Content, Evaluation, Resources */}
              <div className="space-y-5">
                <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 space-y-3.5">
                  <span className="text-[10.5px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Saberes Curriculares</span>
                  
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide block">Contenido Conceptual</label>
                    <textarea
                      value={editorConceptual}
                      onChange={(e) => setEditorConceptual(e.target.value)}
                      className="w-full h-16 p-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide block">Contenido Procedimental</label>
                    <textarea
                      value={editorProcedimental}
                      onChange={(e) => setEditorProcedimental(e.target.value)}
                      className="w-full h-24 p-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide block">Contenido Actitudinal</label>
                    <textarea
                      value={editorActitudinal}
                      onChange={(e) => setEditorActitudinal(e.target.value)}
                      className="w-full h-16 p-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Recursos Escolares</label>
                  <form onSubmit={handleAddResource} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Añadir recurso..."
                      value={newResourceInput}
                      onChange={(e) => setNewResourceInput(e.target.value)}
                      className="flex-1 h-9 px-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none"
                    />
                    <button type="submit" className="h-9 px-3.5 bg-[#1B1B1B] dark:bg-white text-white dark:text-black border-none text-xs font-bold rounded-lg cursor-pointer">
                      Añadir
                    </button>
                  </form>
                  <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto select-none pt-1">
                    {editorResources.map((res, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-[11px] font-bold text-slate-600 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700/50">
                        {res}
                        <button type="button" onClick={() => handleRemoveResource(i)} className="text-slate-400 hover:text-red-500 cursor-pointer bg-transparent border-none p-0 inline-flex">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Evaluación (Indicador / Criterio)</label>
                  <textarea
                    value={editorEvaluation}
                    onChange={(e) => setEditorEvaluation(e.target.value)}
                    className="w-full h-24 p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-xs text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Tarea para el Hogar</label>
                  <textarea
                    value={editorHomework}
                    onChange={(e) => setEditorHomework(e.target.value)}
                    className="w-full h-16 p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-xs text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
          )
        )
      )}
          </motion.div>
        </AnimatePresence>

        {/* Action Controls Navigation */}
        {!(currentStep === 4 && selectedSubject?.id === 'lengua-espanola' && selectedGrade === 'primaria-1ro' && selectedPlanningType === 'DIARIA') && (
          <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80 select-none">
            {/* Botón Cancelar a la izquierda */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                toast.error('Planificación cancelada');
                navigateToPlanificaciones(1000);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white px-5.5 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px cursor-pointer shadow-md border-none"
            >
              <X size={15} />
              Cancelar
            </motion.button>

            {/* Grupo de navegación a la derecha */}
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-955/20 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-350 border border-amber-200 dark:border-amber-900/30 px-5.5 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px cursor-pointer shadow-xs hover:shadow-sm"
                >
                  <ArrowLeft size={15} />
                  Anterior
                </motion.button>
              )}

              {currentStep < 4 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1e40af] hover:bg-[#1b3a9e] text-white px-5.5 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px cursor-pointer shadow-md border-none"
                >
                  Siguiente
                  <ArrowRight size={15} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px cursor-pointer shadow-md border-none"
                >
                  <Save size={15} />
                  Guardar Planificación
                </motion.button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* CONFIRMATION BACK MODAL (from Editor step) */}
      <AnimatePresence>
        {showConfirmBackModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmBackModal(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center"
            >
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
              </div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Volver al Paso Anterior?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Si vuelves atrás perderás los cambios actuales realizados dentro de este editor interactivo. ¿Deseas continuar?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmBackModal(false)}
                  className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmBackModal(false);
                    const targetBackStep = (isUnitBasedSubject && selectedPlanningType === 'DIARIA' && selectedSequenceType === 'CON_BASE') ? 3.5 : 3;
                    setCurrentStep(targetBackStep);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Sí, Volver
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADAPTACIÓN CURRICULAR / INCLUSIÓN SELECTOR MODAL */}
      <AnimatePresence>
        {showInclusionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isGeneratingInclusion) setShowInclusionModal(false);
            }}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[32px] p-6 md:p-8 max-w-lg w-full shadow-2xl relative cursor-default text-left"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                  Estrategias de Inclusión e Intervención Psicopedagógica
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInclusionModal(false)}
                  disabled={isGeneratingInclusion}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer bg-transparent border-none"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-6">
                Selecciona una necesidad educativa específica de apoyo para generar adaptaciones y estrategias personalizadas en tu planificación.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 select-none">
                {[
                  { id: 'DYSLEXIA', label: 'Dislexia / Lectoescritura', desc: 'Dificultades en decodificación.' },
                  { id: 'ADHD', label: 'TDAH / Atención', desc: 'Soporte de enfoque y organización.' },
                  { id: 'AUTISM', label: 'TEA / Espectro Autista', desc: 'Pautas sensoriales y sociales.' },
                  { id: 'HIGH_CAPACITY', label: 'Altas Capacidades', desc: 'Retos y profundización cognitiva.' }
                ].map((item) => {
                  const isActive = inclusionType === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (!isGeneratingInclusion) setInclusionType(item.id as any);
                      }}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                        isActive 
                          ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-400/5' 
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/50'
                      }`}
                    >
                      <span className="block font-bold text-xs text-slate-800 dark:text-white mb-0.5">{item.label}</span>
                      <span className="block text-[10px] text-slate-400 dark:text-zinc-500">{item.desc}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3.5 border-t border-slate-100 dark:border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInclusionModal(false)}
                  disabled={isGeneratingInclusion}
                  className="bg-white dark:bg-zinc-855 hover:bg-black/5 dark:hover:bg-zinc-850 border border-black/10 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 h-9 px-5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleGenerateInclusion}
                  disabled={!inclusionType || isGeneratingInclusion}
                  className="bg-sky-500 hover:bg-sky-600 text-white border-transparent text-xs font-bold h-9 px-6 rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-40"
                >
                  {isGeneratingInclusion ? 'Generando adaptaciones...' : 'Aplicar Adaptaciones'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ModalCreditos
        isOpen={showCreditsExhausted}
        onClose={() => setShowCreditsExhausted(false)}
        requiredCredits={15}
        currentCredits={getUserCredits(user)}
      />
      </div>
    </main>
  );
}
