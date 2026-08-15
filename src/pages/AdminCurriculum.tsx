import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/card';
import { toast, Toaster } from 'sonner';
import { requestD1 } from '../lib/services/d1Client';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layout,
  Brain,
  Users,
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  LogOut,
  Sparkles,
  Zap,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Check,
  Save,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  X,
  List,
  Edit3,
  Calendar,
  Grid,
  Coins
} from 'lucide-react';

import { getUnitsBySubjectAndGrade, Unit, UnitTheme, UnitSubtheme, ContentBlock } from '../lib/data/unitCurriculum';
import ThemeItem from '../components/admin/ThemeItem';
import UnitContentEditor from '../components/admin/UnitContentEditor';
import { AVAILABLE_GRADES } from '../lib/data/educationStructure';
import compiled2ndCycleSequences from '../lib/data/sequences/primaria/compiled_2nd_cycle_sequences.json';
import AdvancedSequenceActivityEditor from '../components/admin/AdvancedSequenceActivityEditor';

// Import local sequences to pre-populate form
import seqLengua1_1ro from '../lib/data/sequences/primaria/1ro/lengua/seq-1-lengua-1ro.json';
import seqLengua2_1ro from '../lib/data/sequences/primaria/1ro/lengua/seq-2-lengua-1ro.json';
import seqLengua3_1ro from '../lib/data/sequences/primaria/1ro/lengua/seq-3-lengua-1ro.json';
import seqLengua4_1ro from '../lib/data/sequences/primaria/1ro/lengua/seq-4-lengua-1ro.json';
import seqLengua5_1ro from '../lib/data/sequences/primaria/1ro/lengua/seq-5-lengua-1ro.json';
import seqLengua6_1ro from '../lib/data/sequences/primaria/1ro/lengua/seq-6-lengua-1ro.json';

import seqMatematica1_1ro from '../lib/data/sequences/primaria/1ro/matematica/seq-1-matematica-1ro.json';
import seqMatematica2_1ro from '../lib/data/sequences/primaria/1ro/matematica/seq-2-matematica-1ro.json';
import seqMatematica3_1ro from '../lib/data/sequences/primaria/1ro/matematica/seq-3-matematica-1ro.json';
import seqMatematica4_1ro from '../lib/data/sequences/primaria/1ro/matematica/seq-4-matematica-1ro.json';
import seqMatematica5_1ro from '../lib/data/sequences/primaria/1ro/matematica/seq-5-matematica-1ro.json';
import seqMatematica6_1ro from '../lib/data/sequences/primaria/1ro/matematica/seq-6-matematica-1ro.json';

// Import 2do Grado sequences from components
import seqLengua1_2do from '../components/forms/Primaria/Segundo Grado/Lengua Española/Secuencias/seq-1.json';
import seqLengua2_2do from '../components/forms/Primaria/Segundo Grado/Lengua Española/Secuencias/seq-2.json';
import seqLengua3_2do from '../components/forms/Primaria/Segundo Grado/Lengua Española/Secuencias/seq-3.json';
import seqLengua4_2do from '../components/forms/Primaria/Segundo Grado/Lengua Española/Secuencias/seq-4.json';
import seqLengua5_2do from '../components/forms/Primaria/Segundo Grado/Lengua Española/Secuencias/seq-5.json';
import seqLengua6_2do from '../components/forms/Primaria/Segundo Grado/Lengua Española/Secuencias/seq-6.json';

import seqMatematica1_2do from '../components/forms/Primaria/Segundo Grado/Matematica/Secuencias/seq-1.json';
import seqMatematica2_2do from '../components/forms/Primaria/Segundo Grado/Matematica/Secuencias/seq-2.json';
import seqMatematica3_2do from '../components/forms/Primaria/Segundo Grado/Matematica/Secuencias/seq-3.json';
import seqMatematica4_2do from '../components/forms/Primaria/Segundo Grado/Matematica/Secuencias/seq-4.json';
import seqMatematica5_2do from '../components/forms/Primaria/Segundo Grado/Matematica/Secuencias/seq-5.json';
import seqMatematica6_2do from '../components/forms/Primaria/Segundo Grado/Matematica/Secuencias/seq-6.json';

// Import 3ro Grado sequences from components
import seqLengua1_3ro from '../components/forms/Primaria/Terccer Grado/Lengua Española/Secuencias/seq-1-autobiografia-3ro.json';
import seqLengua2_3ro from '../components/forms/Primaria/Terccer Grado/Lengua Española/Secuencias/seq-2-instructivo-3ro.json';
import seqLengua3_3ro from '../components/forms/Primaria/Terccer Grado/Lengua Española/Secuencias/seq-3-noticia-3ro.json';
import seqLengua4_3ro from '../components/forms/Primaria/Terccer Grado/Lengua Española/Secuencias/seq-4-cuento-3ro.json';
import seqLengua5_3ro from '../components/forms/Primaria/Terccer Grado/Lengua Española/Secuencias/seq-5-articulo-expositivo-3ro.json';
import seqLengua6_3ro from '../components/forms/Primaria/Terccer Grado/Lengua Española/Secuencias/seq-6-adivinanza-3ro.json';

import seqMatematica1_3ro from '../components/forms/Primaria/Terccer Grado/Matematica/Secuencias/seq-1.json';
import seqMatematica2_3ro from '../components/forms/Primaria/Terccer Grado/Matematica/Secuencias/seq-2.json';
import seqMatematica3_3ro from '../components/forms/Primaria/Terccer Grado/Matematica/Secuencias/seq-3-matematica-3ro.json';
import seqMatematica4_3ro from '../components/forms/Primaria/Terccer Grado/Matematica/Secuencias/seq-4-matematica-3ro.json';
import seqMatematica5_3ro from '../components/forms/Primaria/Terccer Grado/Matematica/Secuencias/seq-5-matematica-3ro.json';
import seqMatematica6_3ro from '../components/forms/Primaria/Terccer Grado/Matematica/Secuencias/seq-6-matematica-3ro.json';

const LOCAL_SEQUENCES: Record<string, any> = {
  'seq-1-lengua-1ro': seqLengua1_1ro,
  'seq-2-lengua-1ro': seqLengua2_1ro,
  'seq-3-lengua-1ro': seqLengua3_1ro,
  'seq-4-lengua-1ro': seqLengua4_1ro,
  'seq-5-lengua-1ro': seqLengua5_1ro,
  'seq-6-lengua-1ro': seqLengua6_1ro,

  'seq-1-matematica-1ro': seqMatematica1_1ro,
  'seq-2-matematica-1ro': seqMatematica2_1ro,
  'seq-3-matematica-1ro': seqMatematica3_1ro,
  'seq-4-matematica-1ro': seqMatematica4_1ro,
  'seq-5-matematica-1ro': seqMatematica5_1ro,
  'seq-6-matematica-1ro': seqMatematica6_1ro,

  'seq-1-lengua-2do': seqLengua1_2do,
  'seq-2-lengua-2do': seqLengua2_2do,
  'seq-3-lengua-2do': seqLengua3_2do,
  'seq-4-lengua-2do': seqLengua4_2do,
  'seq-5-lengua-2do': seqLengua5_2do,
  'seq-6-lengua-2do': seqLengua6_2do,

  'seq-1-matematica-2do': seqMatematica1_2do,
  'seq-2-matematica-2do': seqMatematica2_2do,
  'seq-3-matematica-2do': seqMatematica3_2do,
  'seq-4-matematica-2do': seqMatematica4_2do,
  'seq-5-matematica-2do': seqMatematica5_2do,
  'seq-6-matematica-2do': seqMatematica6_2do,

  'seq-1-lengua-3ro': seqLengua1_3ro,
  'seq-2-lengua-3ro': seqLengua2_3ro,
  'seq-3-lengua-3ro': seqLengua3_3ro,
  'seq-4-lengua-3ro': seqLengua4_3ro,
  'seq-5-lengua-3ro': seqLengua5_3ro,
  'seq-6-lengua-3ro': seqLengua6_3ro,

  'seq-1-matematica-3ro': seqMatematica1_3ro,
  'seq-2-matematica-3ro': seqMatematica2_3ro,
  'seq-3-matematica-3ro': seqMatematica3_3ro,
  'seq-4-matematica-3ro': seqMatematica4_3ro,
  'seq-5-matematica-3ro': seqMatematica5_3ro,
  'seq-6-matematica-3ro': seqMatematica6_3ro,
};

const getSubjectIcon = (subjectId: string): string => {
  const normalizedId = subjectId.toLowerCase().replace(/^(primaria|secundaria|inicial)-/, '');
  if (normalizedId.startsWith('ingles')) return '🗣️';
  if (normalizedId.startsWith('lengua')) return '📓';
  if (normalizedId.startsWith('matematica')) return '🔢';
  if (normalizedId.startsWith('sociales')) return '🌍';
  if (normalizedId.startsWith('naturales')) return '🌻';
  if (normalizedId.startsWith('formacion')) return '🤝';
  if (normalizedId.startsWith('educacion-fisica')) return '⚾';
  if (normalizedId.startsWith('educacion-artistica')) return '🧵';
  return '📘';
};

const getGradeIcon = (gradeId: string): string => {
  if (gradeId.includes('1ro')) return '1️⃣';
  if (gradeId.includes('2do')) return '2️⃣';
  if (gradeId.includes('3ro')) return '3️⃣';
  if (gradeId.includes('4to')) return '4️⃣';
  if (gradeId.includes('5to')) return '5️⃣';
  if (gradeId.includes('6to')) return '6️⃣';
  return '🏫';
};

const GRADES = [
  { id: 'primaria-1ro', name: '1er Grado de Primaria', level: 'PRIMARIA' },
  { id: 'primaria-2do', name: '2do Grado de Primaria', level: 'PRIMARIA' },
  { id: 'primaria-3ro', name: '3er Grado de Primaria', level: 'PRIMARIA' }
];

const SUBJECTS = [
  { id: 'lengua-espanola', name: 'Lengua Española', key: 'lengua' },
  { id: 'matematica', name: 'Matemática', key: 'matematica' }
];

const UNIT_SUBJECTS = [
  { id: 'educacion-artistica', name: 'Educación Artística' },
  { id: 'educacion-fisica', name: 'Educación Física' },
  { id: 'formacion-humana', name: 'Formación Integral Humana y Religiosa' },
  { id: 'sociales', name: 'Ciencias Sociales' },
  { id: 'naturales', name: 'Ciencias de la Naturaleza' },
  { id: 'ingles', name: 'Lenguas Extranjeras (Inglés)' },
  { id: 'lengua-espanola', name: 'Lengua Española' },
  { id: 'matematica', name: 'Matemática' }
];

const UNIT_GRADES = [
  // Primaria
  { id: '1ro', name: '1er Grado (Primaria)', level: 'PRIMARIA' },
  { id: '2do', name: '2do Grado (Primaria)', level: 'PRIMARIA' },
  { id: '3ro', name: '3er Grado (Primaria)', level: 'PRIMARIA' },
  { id: '4to', name: '4to Grado (Primaria)', level: 'PRIMARIA' },
  { id: '5to', name: '5to Grado (Primaria)', level: 'PRIMARIA' },
  { id: '6to', name: '6to Grado (Primaria)', level: 'PRIMARIA' },
  // Secundaria
  { id: '1ro Sec', name: '1er Grado (Secundaria)', level: 'SECUNDARIA' },
  { id: '2do Sec', name: '2do Grado (Secundaria)', level: 'SECUNDARIA' },
  { id: '3ro Sec', name: '3er Grado (Secundaria)', level: 'SECUNDARIA' },
  { id: '4to Sec', name: '4to Grado (Secundaria)', level: 'SECUNDARIA' },
  { id: '5to Sec', name: '5to Grado (Secundaria)', level: 'SECUNDARIA' },
  { id: '6to Sec', name: '6to Grado (Secundaria)', level: 'SECUNDARIA' }
];

const SEQUENCES_BY_GRADE_SUBJECT: Record<string, Record<string, { id: string, title: string }[]>> = {
  'primaria-1ro': {
    'lengua-espanola': [
      { id: 'seq-1-lengua-1ro', title: 'Secuencia 1: Tarjeta de identidad' },
      { id: 'seq-2-lengua-1ro', title: 'Secuencia 2: El letrero' },
      { id: 'seq-3-lengua-1ro', title: 'Secuencia 3: La etiqueta' },
      { id: 'seq-4-lengua-1ro', title: 'Secuencia 4: La receta' },
      { id: 'seq-5-lengua-1ro', title: 'Secuencia 5: La noticia' },
      { id: 'seq-6-lengua-1ro', title: 'Secuencia 6: El cuento' }
    ],
    'matematica': [
      { id: 'seq-1-matematica-1ro', title: 'Secuencia 1: ¿Cuántos hay?' },
      { id: 'seq-2-matematica-1ro', title: 'Secuencia 2: Números y Problemas' },
      { id: 'seq-3-matematica-1ro', title: 'Secuencia 3: El Circo' },
      { id: 'seq-4-matematica-1ro', title: 'Secuencia 4: Juegos, sumas y restas' },
      { id: 'seq-5-matematica-1ro', title: 'Secuencia 5: ¡Feliz Cumpleaños!' },
      { id: 'seq-6-matematica-1ro', title: 'Secuencia 6: ¡Cosas Sabrosas!' }
    ]
  },
  'primaria-2do': {
    'lengua-espanola': [
      { id: 'seq-1-lengua-2do', title: 'Secuencia 1: Documento de Identidad' },
      { id: 'seq-2-lengua-2do', title: 'Secuencia 2: La Etiqueta' },
      { id: 'seq-3-lengua-2do', title: 'Secuencia 3: La Receta' },
      { id: 'seq-4-lengua-2do', title: 'Secuencia 4: La Noticia' },
      { id: 'seq-5-lengua-2do', title: 'Secuencia 5: El Cuento' },
      { id: 'seq-6-lengua-2do', title: 'Secuencia 6: El Instructivo' }
    ],
    'matematica': [
      { id: 'seq-1-matematica-2do', title: 'Secuencia 1: Un día en la playa (Suma/Resta)' },
      { id: 'seq-2-matematica-2do', title: 'Secuencia 2: Estrategias de cálculo y juegos' },
      { id: 'seq-3-matematica-2do', title: 'Secuencia 3: Números grandes y valor posicional' },
      { id: 'seq-4-matematica-2do', title: 'Secuencia 4: Sumas, restas y multiplicaciones' },
      { id: 'seq-5-matematica-2do', title: 'Secuencia 5: Razonamiento lógico y numérico' },
      { id: 'seq-6-matematica-2do', title: 'Secuencia 6: Registro y análisis de puntajes' }
    ]
  },
  'primaria-3ro': {
    'lengua-espanola': [
      { id: 'seq-1-lengua-3ro', title: 'La autobiografía' },
      { id: 'seq-2-lengua-3ro', title: 'Secuencia 2: El Instructivo' },
      { id: 'seq-3-lengua-3ro', title: 'Secuencia 3: La Noticia' },
      { id: 'seq-4-lengua-3ro', title: 'Secuencia 4: El Cuento' },
      { id: 'seq-5-lengua-3ro', title: 'Secuencia 5: El Artículo Expositivo' },
      { id: 'seq-6-lengua-3ro', title: 'Secuencia 6: Las Adivinanzas' }
    ],
    'matematica': [
      { id: 'seq-1-matematica-3ro', title: 'Secuencia 1: Repaso de conceptos y conteo' },
      { id: 'seq-2-matematica-3ro', title: 'Secuencia 2: Parque de diversiones' },
      { id: 'seq-3-matematica-3ro', title: 'Secuencia 3: Festejos de cumpleaños' },
      { id: 'seq-4-matematica-3ro', title: 'Secuencia 4: Juegos de azar y conteo' },
      { id: 'seq-5-matematica-3ro', title: 'Secuencia 5: Cuidado de mascotas y datos' },
      { id: 'seq-6-matematica-3ro', title: 'Secuencia 6: Viajes, paseos y grandes números' }
    ]
  }
};

// Official Matemática 1er Grado metadata from Supabase
const MATEMATICA_1RO_METADATA: Record<string, { title: string; description: string; order: number; durationWeeks: number }> = {
  'seq-1-matematica-1ro': {
    title: '\u00bfCu\u00e1ntos hay?',
    description: 'Conteo y reconocimiento de cantidades para saber cu\u00e1ntos elementos hay en una colecci\u00f3n.',
    order: 1,
    durationWeeks: 4
  },
  'seq-2-matematica-1ro': {
    title: 'N\u00fameros y Problemas',
    description: 'Uso de los n\u00fameros para resolver situaciones sencillas de la vida cotidiana.',
    order: 2,
    durationWeeks: 4
  },
  'seq-3-matematica-1ro': {
    title: 'El Circo',
    description: 'Comparaci\u00f3n de cantidades y uso de n\u00fameros en contextos l\u00fadicos.',
    order: 3,
    durationWeeks: 4
  },
  'seq-4-matematica-1ro': {
    title: 'Juegos, sumas y restas',
    description: 'Resoluci\u00f3n de sumas y restas simples mediante juegos y actividades pr\u00e1cticas.',
    order: 4,
    durationWeeks: 4
  },
  'seq-5-matematica-1ro': {
    title: '\u00a1Feliz Cumplea\u00f1os!',
    description: 'Uso de n\u00fameros para ordenar, contar y reconocer el paso del tiempo.',
    order: 5,
    durationWeeks: 4
  },
  'seq-6-matematica-1ro': {
    title: '\u00a1Cosas Sabrosas!',
    description: 'Conteo, comparaci\u00f3n y resoluci\u00f3n de problemas con alimentos y situaciones cercanas.',
    order: 6,
    durationWeeks: 4
  }
};

/**
 * Normalizes any raw sequence (local JSON or DB override) to the standard editor schema.
 * Handles field name mismatches between Lengua (id/title) and Matemática (sequenceId/sequenceTitle).
 */
const normalizeSequenceForEditor = (seq: any, id: string): any => {
  if (!seq) return null;
  const normalized = JSON.parse(JSON.stringify(seq)); // deep clone

  // Check if we have official metadata for this sequence
  const officialMeta = MATEMATICA_1RO_METADATA[id];

  // Root metadata normalization
  normalized.id = normalized.id || normalized.sequenceId || id;
  normalized.title = normalized.title || normalized.sequenceTitle || officialMeta?.title || "";
  
  if (!normalized.gradeId) {
    if (id.includes('-1ro')) normalized.gradeId = 'primaria-1ro';
    else if (id.includes('-2do')) normalized.gradeId = 'primaria-2do';
    else if (id.includes('-3ro')) normalized.gradeId = 'primaria-3ro';
    else normalized.gradeId = 'primaria-1ro';
  }
  
  if (!normalized.subjectId) {
    normalized.subjectId = id.includes('matematica') ? 'matematica' : 'lengua';
  }
  if (normalized.subjectId === 'matematica-1ro') normalized.subjectId = 'matematica';

  // Order
  if (normalized.order === undefined || normalized.order === null || normalized.order === '') {
    if (officialMeta) {
      normalized.order = officialMeta.order;
    } else {
      const matched = id.match(/seq-(\d+)/);
      normalized.order = matched ? parseInt(matched[1]) : 1;
    }
  }

  // Duration
  if (normalized.durationWeeks === undefined || normalized.durationWeeks === null || normalized.durationWeeks === '') {
    normalized.durationWeeks = officialMeta?.durationWeeks || 4;
  }

  // Description
  if (!normalized.description) {
    if (officialMeta?.description) {
      normalized.description = officialMeta.description;
    } else {
      const order = normalized.order || 1;
      if (id.includes('lengua')) {
        const descs2do = [
          "Secuencia centrada en el reconocimiento del nombre propio y documentos de identidad.",
          "Comprensión y producción de etiquetas para identificar productos de uso cotidiano.",
          "Exploración de la estructura y función de las recetas de cocina sencillas.",
          "Lectura y comprensión de noticias locales sencillas e identificación de su estructura.",
          "Lectura y análisis de cuentos infantiles sencillos para fomentar la imaginación.",
          "Comprensión y redacción de instructivos sencillos para realizar tareas cotidianas."
        ];
        const descs3ro = [
          "Secuencia didáctica centrada en la comprensión y producción de la autobiografía personal.",
          "Exploración de instructivos, su estructura textual y seguimiento de instrucciones en actividades.",
          "Lectura y producción de noticias sencillas del entorno comunitario y escolar.",
          "Fomento de la lectura comprensiva mediante el análisis y recreación de cuentos.",
          "Lectura e indagación sobre temas de interés mediante artículos expositivos sencillos.",
          "Desarrollo de la creatividad y razonamiento lingüístico a través de las adivinanzas."
        ];
        normalized.description = id.includes('2do') ? (descs2do[order - 1] || "") : (descs3ro[order - 1] || "");
      } else {
        const descs2do = [
          "Resolución de problemas cotidianos de suma y resta en el contexto de un día en la playa.",
          "Estrategias de cálculo mental y resolución de problemas matemáticos mediante juegos.",
          "Reconocimiento y lectura de números más grandes y su valor posicional.",
          "Cálculos aditivos y multiplicativos sencillos y resolución de problemas cotidianos.",
          "Preparación de juegos y actividades que estimulen el razonamiento lógico y numérico.",
          "Aplicación de las matemáticas en el registro y análisis de puntajes deportivos."
        ];
        const descs3ro = [
          "Actividades de inicio de tercer grado para repasar conceptos básicos y afianzar el conteo.",
          "Resolución de problemas matemáticos en el contexto de visitas y juegos en un parque de diversiones.",
          "Uso del cálculo y la organización de datos aplicados al planeamiento de festejos de cumpleaños.",
          "Exploración de juegos de azar, estrategias de conteo y razonamiento lógico mediante dinámicas lúdicas.",
          "Análisis de datos, conteo y resolución de problemas inspirados en el cuidado de mascotas.",
          "Cálculos aditivos y multiplicativos con números grandes en situaciones de viajes y paseos."
        ];
        normalized.description = id.includes('2do') ? (descs2do[order - 1] || "") : (descs3ro[order - 1] || "");
      }
    }
  }

  // Normalize nested blocks, activities, and moments
  if (Array.isArray(normalized.blocks)) {
    normalized.blocks = normalized.blocks.map((blk: any, bIdx: number) => {
      const b = { ...blk };
      b.id = b.id || `blk-${id}-${bIdx + 1}`;
      b.title = b.title || b.blockTitle || `Bloque ${b.blockNumber || (bIdx + 1)}`;
      b.blockNumber = b.blockNumber !== undefined ? b.blockNumber : bIdx + 1;

      if (Array.isArray(b.activities)) {
        b.activities = b.activities.map((act: any, aIdx: number) => {
          const a = { ...act };
          a.id = a.id || `act-${id}-${bIdx + 1}-${aIdx + 1}`;
          a.title = a.title || a.activityTitle || `Actividad ${aIdx + 1}`;

          if (Array.isArray(a.moments)) {
            a.moments = a.moments.map((mom: any, mIdx: number) => {
              const m = { ...mom };
              // Matemática uses "title", editor expects "titulo"
              m.titulo = m.titulo || m.title || `Momento ${mIdx + 1}`;
              m.description = m.description || m.descripcion || "";
              return m;
            });
          }
          return a;
        });
      }
      return b;
    });
  }

  return normalized;
};

export default function AdminCurriculum() {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  // Navigation / Selection State
  const [selectedLevel] = useState('PRIMARIA');
  const [selectedGrade, setSelectedGrade] = useState('primaria-1ro');
  const [selectedSubject, setSelectedSubject] = useState('lengua-espanola');
  const [selectedSeqId, setSelectedSeqId] = useState('seq-1-lengua-1ro');

  // Active Module tab
  const [activeModule, setActiveModule] = useState<'sequences' | 'sequences_2nd_cycle' | 'units'>('sequences');

  // 2nd Cycle Sequences tab state
  const [selected2ndCycleGrade, setSelected2ndCycleGrade] = useState('primaria-4to');
  const [selected2ndCycleSubject, setSelected2ndCycleSubject] = useState<'lengua' | 'matematica'>('lengua');
  const [selected2ndCycleSeqId, setSelected2ndCycleSeqId] = useState('');
  const [editing2ndCycleSequence, setEditing2ndCycleSequence] = useState<any>(null);

  const [show2ndCycleGradeDropdown, setShow2ndCycleGradeDropdown] = useState(false);
  const [show2ndCycleSubjectDropdown, setShow2ndCycleSubjectDropdown] = useState(false);
  const [show2ndCycleSeqDropdown, setShow2ndCycleSeqDropdown] = useState(false);

  // Unit Manager State
  const [selectedUnitSubject, setSelectedUnitSubject] = useState<string>('sociales');
  const [selectedUnitGrade, setSelectedUnitGrade] = useState<string>('1ro');
  const [showUnitSubjectDropdown, setShowUnitSubjectDropdown] = useState(false);
  const [showUnitGradeDropdown, setShowUnitGradeDropdown] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [customUnits, setCustomUnits] = useState<any[]>([]);

  // Modals for Units Editor
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitForm, setUnitForm] = useState<{ id?: string; name: string; grade_levels: string[] }>({ name: '', grade_levels: [] });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [themeForm, setThemeForm] = useState<{ id?: string; name: string }>({ name: '' });

  const [isSubthemeModalOpen, setIsSubthemeModalOpen] = useState(false);
  const [subthemeForm, setSubthemeForm] = useState<{ id?: string; name: string }>({ name: '' });

  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);
  const [subthemeToDelete, setSubthemeToDelete] = useState<string | null>(null);

  // Dropdown states matching /aula-virtual/matricula/ style
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showSeqDropdown, setShowSeqDropdown] = useState(false);

  // DB Overrides State
  const [dbOverrides, setDbOverrides] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Active Sequence Data State for editing
  const [editingSequence, setEditingSequence] = useState<any>(null);

  // UI state for collapses
  const [openBlockIdx, setOpenBlockIdx] = useState<number | null>(0);
  const [openActivityIdx, setOpenActivityIdx] = useState<string | null>(null); // format: "blockIdx-activityIdx"
  const [blockIdxToDelete, setBlockIdxToDelete] = useState<number | null>(null);

  // Search filter states
  const [seqSearchQuery, setSeqSearchQuery] = useState('');
  const [seq2ndSearchQuery, setSeq2ndSearchQuery] = useState('');

  // School Year Config States
  const [isSchoolYearModalOpen, setIsSchoolYearModalOpen] = useState(false);
  const [schoolYearInput, setSchoolYearInput] = useState(() => localStorage.getItem('plx:active_school_year') || '2025-2026');

  // Helper to get sequence info for the 1er Ciclo sidebar list
  const getSequenceInfo = (seqId: string) => {
    const override = dbOverrides[seqId];
    const local = LOCAL_SEQUENCES[seqId];
    const seqData = override || local;
    if (!seqData) return { blocksCount: 0, activitiesCount: 0 };
    const blocks = seqData.blocks || [];
    let activitiesCount = 0;
    blocks.forEach((b: any) => {
      activitiesCount += (b.activities || []).length;
    });
    return {
      blocksCount: blocks.length,
      activitiesCount
    };
  };

  // Helper to get sequence info for the 2do Ciclo sidebar list
  const get2ndCycleSequenceInfo = (seqId: string) => {
    const override = dbOverrides[seqId];
    const local = (compiled2ndCycleSequences as any)[seqId];
    const seqData = override || local;
    if (!seqData) return { activitiesCount: 0 };
    const activitiesCount = (seqData.activities || []).length;
    return {
      activitiesCount
    };
  };

  // Primitive dependencies to prevent infinite useEffect loops
  const userId = currentUser?.id;
  const userRol = currentUser?.rol;

  // Fetch overrides on mount or sequence change
  useEffect(() => {
    if (!userId || userRol !== 'admin') {
      navigate('/login');
      return;
    }
    fetchOverrides();
    fetchCustomUnits();
  }, [userId, userRol, navigate]);

  const fetchCustomUnits = async () => {
    try {
      const data = await requestD1<any[]>('/api/custom-units');
      if (Array.isArray(data)) {
        setCustomUnits(data);
      }
    } catch (error: any) {
      console.error('Error fetching custom units:', error);
    }
  };

  const fetchOverrides = async () => {
    setIsLoading(true);
    try {
      const data = await requestD1<any[]>('/api/custom-sequences');
      if (Array.isArray(data)) {
        const map: Record<string, any> = {};
        data.forEach(item => {
          map[item.id] = item.content;
        });
        setDbOverrides(map);
      }
    } catch (error: any) {
      console.error('Error fetching sequences overrides:', error);
      toast.error(`Error al conectar con la base de datos de secuencias: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function loadSchoolYear() {
      try {
        const config = await requestD1<{ key: string; value: any }>('/api/site-configs/active_school_year');
        if (config && config.value) {
          setSchoolYearInput(config.value);
        }
      } catch (err) {
        console.warn('Error loading active school year:', err);
      }
    }
    loadSchoolYear();
  }, []);

  const handleSaveSchoolYear = async () => {
    if (!schoolYearInput.trim()) {
      toast.error('Por favor ingresa un año escolar válido');
      return;
    }
    setIsLoading(true);
    try {
      await requestD1('/api/site-configs', 'POST', {
        key: 'active_school_year',
        value: schoolYearInput.trim()
      });
      localStorage.setItem('plx:active_school_year', schoolYearInput.trim());
      window.dispatchEvent(new Event('plx:active_school_year_changed'));
      toast.success('¡Año escolar establecido correctamente!');
      setIsSchoolYearModalOpen(false);
    } catch (error: any) {
      console.error('Error saving school year:', error);
      toast.error(`Error al establecer año escolar: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered 2nd Cycle sequences based on selections
  const filtered2ndCycleSeqs = React.useMemo(() => {
    return Object.values(compiled2ndCycleSequences)
      .filter((s: any) => 
        s.grade_id === selected2ndCycleGrade && 
        (selected2ndCycleSubject === 'lengua' ? s.subject_id.startsWith('lengua') : s.subject_id.startsWith('matematica'))
      )
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  }, [selected2ndCycleGrade, selected2ndCycleSubject]);

  // Filtered 1er Ciclo sequences based on selections & search query
  const filteredSeqsList = React.useMemo(() => {
    const query = seqSearchQuery.toLowerCase().trim();
    const seqs = SEQUENCES_BY_GRADE_SUBJECT[selectedGrade]?.[selectedSubject] || [];
    if (!query) return seqs;
    return seqs.filter(s => s.title.toLowerCase().includes(query) || s.id.toLowerCase().includes(query));
  }, [selectedGrade, selectedSubject, seqSearchQuery]);

  // Filtered 2do Ciclo sequences based on selections & search query
  const filtered2ndCycleSeqsList = React.useMemo(() => {
    const query = seq2ndSearchQuery.toLowerCase().trim();
    if (!query) return filtered2ndCycleSeqs;
    return filtered2ndCycleSeqs.filter((s: any) => s.title.toLowerCase().includes(query) || s.id.toLowerCase().includes(query));
  }, [filtered2ndCycleSeqs, seq2ndSearchQuery]);

  // Set initial sequence when filter list changes
  useEffect(() => {
    if (filtered2ndCycleSeqs.length > 0) {
      const exists = filtered2ndCycleSeqs.some((s: any) => s.id === selected2ndCycleSeqId);
      if (!exists) {
        setSelected2ndCycleSeqId(filtered2ndCycleSeqs[0].id);
      }
    } else {
      setSelected2ndCycleSeqId('');
    }
  }, [filtered2ndCycleSeqs]);

  // Load and merge sequence editing state
  useEffect(() => {
    if (selected2ndCycleSeqId) {
      const override = dbOverrides[selected2ndCycleSeqId];
      const local = (compiled2ndCycleSequences as any)[selected2ndCycleSeqId];

      let merged: any = null;
      if (override) {
        merged = {
          ...local,
          ...override,
          activities: override.activities || local?.activities || []
        };
      } else if (local) {
        merged = local;
      }

      if (merged) {
        setEditing2ndCycleSequence(JSON.parse(JSON.stringify(merged)));
      } else {
        setEditing2ndCycleSequence(null);
      }
    } else {
      setEditing2ndCycleSequence(null);
    }
  }, [selected2ndCycleSeqId, dbOverrides]);

  const update2ndCycleSequenceMetadata = (field: string, value: any) => {
    setEditing2ndCycleSequence((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Save changes to D1 for 2nd Cycle
  const handleSave2ndCycleToDatabase = async () => {
    if (!editing2ndCycleSequence) return;
    setIsLoading(true);
    try {
      await requestD1('/api/custom-sequences', 'POST', {
        id: selected2ndCycleSeqId,
        subject_id: editing2ndCycleSequence.subject_id,
        grade_id: editing2ndCycleSequence.grade_id,
        content: editing2ndCycleSequence
      });
      toast.success('¡Secuencia del 2do Ciclo guardada y sincronizada en D1!');
      fetchOverrides();
    } catch (error: any) {
      console.error('Error saving 2nd cycle sequence:', error);
      toast.error(`Error al guardar: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Revert / Reset override for 2nd Cycle
  const handleReset2ndCycleToDefault = async () => {
    if (!dbOverrides[selected2ndCycleSeqId]) {
      const local = (compiled2ndCycleSequences as any)[selected2ndCycleSeqId];
      if (local) {
        setEditing2ndCycleSequence(JSON.parse(JSON.stringify(local)));
        toast.success('Editor restaurado a valores por defecto locales.');
      }
      return;
    }

    if (!window.confirm('¿Estás seguro de que deseas eliminar la personalización de esta secuencia y volver al archivo original?')) {
      return;
    }

    setIsLoading(true);
    try {
      await requestD1(`/api/custom-sequences/${selected2ndCycleSeqId}`, 'DELETE');
      toast.success('Personalización eliminada. Restaurado a valores de fábrica.');
      fetchOverrides();
    } catch (error: any) {
      console.error('Error resetting 2nd cycle sequence:', error);
      toast.error(`Error al restaurar: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Download updated JSON for 2nd Cycle
  const handleDownload2ndCycleJson = () => {
    if (!editing2ndCycleSequence) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(editing2ndCycleSequence, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${selected2ndCycleSeqId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('¡JSON del 2do Ciclo descargado correctamente!');
  };

  // Derived unit lists
  const mergedUnits = React.useMemo(() => {
    const staticUnits = getUnitsBySubjectAndGrade(selectedUnitSubject, selectedUnitGrade);
    const filteredCustom = customUnits
      .filter(cu => {
        const subjectMatch = cu.subject_id === selectedUnitSubject ||
          (selectedUnitSubject === 'educacion-artistica' && (cu.subject_id === 'educacion-artistica-sec' || cu.subject_id === 'educacion-artistica')) ||
          (selectedUnitSubject === 'educacion-fisica' && (cu.subject_id === 'educacion-fisica-sec' || cu.subject_id === 'educacion-fisica')) ||
          (selectedUnitSubject === 'formacion-humana' && (cu.subject_id === 'formacion-humana-sec' || cu.subject_id === 'formacion-humana')) ||
          (selectedUnitSubject === 'sociales' && (cu.subject_id === 'sociales-sec' || cu.subject_id === 'sociales')) ||
          (selectedUnitSubject === 'naturales' && (cu.subject_id === 'naturales-sec' || cu.subject_id === 'naturales'));

        const isSec = selectedUnitGrade.includes('Sec') || selectedUnitGrade.includes('secundaria');
        const normalizedUnitGrade = selectedUnitGrade.replace(/^(primaria|secundaria|inicial)-/, '').replace(/\s*sec$/i, '').trim();
        const cuGradeNorm = (cu.grade_id || '').replace(/^(primaria|secundaria|inicial)-/, '').replace(/\s*sec$/i, '').trim();
        const cuIsSec = (cu.grade_id || '').toLowerCase().includes('sec') || (cu.grade_id || '').startsWith('secundaria-') || cu.subject_id?.includes('-sec');

        let gradeMatch = cu.grade_id === selectedUnitGrade;
        if (!gradeMatch) {
          if (isSec) {
            gradeMatch = cuIsSec && cuGradeNorm === normalizedUnitGrade;
          } else {
            gradeMatch = !cuIsSec && cuGradeNorm === normalizedUnitGrade;
          }
        }

        return subjectMatch && gradeMatch;
      })
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
    return Array.from(map.values());
  }, [selectedUnitSubject, selectedUnitGrade, customUnits]);

  const selectedUnit = React.useMemo(() => {
    return mergedUnits.find(u => u.id === selectedUnitId) || null;
  }, [mergedUnits, selectedUnitId]);

  const selectedTheme = React.useMemo(() => {
    return selectedUnit?.themes?.find(t => t.id === selectedThemeId) || null;
  }, [selectedUnit, selectedThemeId]);

  // Clean selection if it is no longer valid
  useEffect(() => {
    if (selectedUnitId && !mergedUnits.some(u => u.id === selectedUnitId)) {
      setSelectedUnitId('');
      setSelectedThemeId('');
    }
  }, [mergedUnits, selectedUnitId]);

  // Save unit helper
  const saveUnitToD1 = async (unit: Unit) => {
    setIsLoading(true);
    try {
      await requestD1('/api/custom-units', 'POST', {
        id: unit.id,
        subject_id: selectedUnitSubject,
        grade_id: selectedUnitGrade,
        content: unit
      });
      toast.success('¡Unidad guardada y sincronizada correctamente!');
      await fetchCustomUnits();
    } catch (error: any) {
      console.error('Error saving unit:', error);
      toast.error(`Error al guardar unidad: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete unit helper
  const deleteUnitFromD1 = async (unitId: string) => {
    setIsLoading(true);
    try {
      const isStatic = getUnitsBySubjectAndGrade(selectedUnitSubject, selectedUnitGrade).some(u => u.id === unitId);
      if (isStatic) {
        const unit = mergedUnits.find(u => u.id === unitId);
        if (unit) {
          await requestD1('/api/custom-units', 'POST', {
            id: unitId,
            subject_id: selectedUnitSubject,
            grade_id: selectedUnitGrade,
            content: { ...unit, isDeleted: true }
          });
        }
      } else {
        await requestD1(`/api/custom-units/${unitId}`, 'DELETE');
      }
      toast.success('Unidad eliminada correctamente.');
      if (selectedUnitId === unitId) {
        setSelectedUnitId('');
        setSelectedThemeId('');
      }
      await fetchCustomUnits();
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      toast.error(`Error al eliminar unidad: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Unit handlers
  const handleSaveUnitForm = async () => {
    if (!unitForm.name.trim()) return;
    if (!unitForm.grade_levels || unitForm.grade_levels.length === 0) {
      toast.error('Selecciona al menos un grado');
      return;
    }
    if (unitForm.id) {
      const existing = mergedUnits.find(u => u.id === unitForm.id);
      if (existing) {
        const updated: Unit = {
          ...existing,
          name: unitForm.name,
          grade_levels: unitForm.grade_levels
        };
        await saveUnitToD1(updated);
      }
    } else {
      const newUnit: Unit = {
        id: crypto.randomUUID(),
        name: unitForm.name,
        themes: [],
        grade_levels: unitForm.grade_levels,
        subjectId: selectedUnitSubject
      };
      await saveUnitToD1(newUnit);
      setSelectedUnitId(newUnit.id);
    }
    setIsUnitModalOpen(false);
  };

  // Theme handlers
  const handleSaveThemeForm = async () => {
    if (!themeForm.name.trim() || !selectedUnit) return;
    let updatedUnit: Unit;
    if (themeForm.id) {
      updatedUnit = {
        ...selectedUnit,
        themes: (selectedUnit.themes || []).map(t => t.id === themeForm.id ? { ...t, name: themeForm.name } : t)
      };
    } else {
      const newTheme = {
        id: crypto.randomUUID(),
        name: themeForm.name,
        subthemes: []
      };
      updatedUnit = {
        ...selectedUnit,
        themes: [...(selectedUnit.themes || []), newTheme]
      };
    }
    await saveUnitToD1(updatedUnit);
    setIsThemeModalOpen(false);
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (!selectedUnit) return;
    const updatedUnit = {
      ...selectedUnit,
      themes: (selectedUnit.themes || []).filter(t => t.id !== themeId)
    };
    await saveUnitToD1(updatedUnit);
    if (selectedThemeId === themeId) {
      setSelectedThemeId('');
    }
  };

  const handleMoveTheme = async (themeId: string, direction: 'up' | 'down') => {
    if (!selectedUnit) return;
    const index = selectedUnit.themes.findIndex(t => t.id === themeId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedUnit.themes.length) return;

    const themes = [...selectedUnit.themes];
    const temp = themes[index];
    themes[index] = themes[targetIndex];
    themes[targetIndex] = temp;

    const updatedUnit = {
      ...selectedUnit,
      themes
    };
    await saveUnitToD1(updatedUnit);
  };

  // Subtheme handlers
  const handleSaveSubthemeForm = async () => {
    if (!subthemeForm.name.trim() || !selectedUnit || !selectedTheme) return;
    let updatedUnit: Unit;
    if (subthemeForm.id) {
      updatedUnit = {
        ...selectedUnit,
        themes: selectedUnit.themes.map(t => {
          if (t.id === selectedTheme.id) {
            return {
              ...t,
              subthemes: (t.subthemes || []).map(s => s.id === subthemeForm.id ? { ...s, name: subthemeForm.name } : s)
            };
          }
          return t;
        })
      };
    } else {
      const newSubtheme = {
        id: crypto.randomUUID(),
        name: subthemeForm.name
      };
      updatedUnit = {
        ...selectedUnit,
        themes: selectedUnit.themes.map(t => {
          if (t.id === selectedTheme.id) {
            return {
              ...t,
              subthemes: [...(t.subthemes || []), newSubtheme]
            };
          }
          return t;
        })
      };
    }
    await saveUnitToD1(updatedUnit);
    setIsSubthemeModalOpen(false);
  };

  const handleDeleteSubtheme = async (subthemeId: string) => {
    if (!selectedUnit || !selectedTheme) return;
    const updatedUnit = {
      ...selectedUnit,
      themes: selectedUnit.themes.map(t => {
        if (t.id === selectedTheme.id) {
          return {
            ...t,
            subthemes: (t.subthemes || []).filter(s => s.id !== subthemeId)
          };
        }
        return t;
      })
    };
    await saveUnitToD1(updatedUnit);
  };

  // Conceptual block handlers
  const handleSaveBlocks = async (blocks: ContentBlock[]) => {
    if (!selectedUnit) return;
    const updatedUnit = {
      ...selectedUnit,
      conceptual_content: blocks,
      procedural_content: [],
      attitudinal_content: []
    };
    await saveUnitToD1(updatedUnit);
  };

  // Populate editor when selections change (with normalization for Matemática field mismatches)
  useEffect(() => {
    if (selectedSeqId) {
      const override = dbOverrides[selectedSeqId];
      const local = LOCAL_SEQUENCES[selectedSeqId];

      let merged: any = null;
      if (override) {
        // Merge with local fallback defaults
        merged = {
          ...local,
          ...override,
          blocks: override.blocks || local?.blocks || []
        };
      } else if (local) {
        merged = local;
      }

      if (merged) {
        const normalized = normalizeSequenceForEditor(merged, selectedSeqId);
        setEditingSequence(normalized);
      } else {
        setEditingSequence(null);
      }
    }
  }, [selectedSeqId, dbOverrides]);

  const handleLogout = () => {
    supabase.auth.signOut();
    localStorage.removeItem('plx:user');
    localStorage.removeItem('plx:session');
    toast.success("👋 Sesión cerrada correctamente.");
    navigate("/login");
  };

  // Check role
  if (!currentUser || currentUser.rol !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-neutral-100 dark:border-zinc-800 shadow-xl max-w-sm w-full mx-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-zinc-100">Verificando Credenciales</h3>
          <p className="text-xs text-neutral-500 dark:text-zinc-400">Verificando rol de administrador para esta sesión...</p>
        </div>
      </div>
    );
  }

  // Edit sequence helper functions (Fully immutable to prevent double-creation in React StrictMode)
  const updateSequenceMetadata = (field: string, value: any) => {
    setEditingSequence((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const updateBlock = (blockIdx: number, field: string, value: any) => {
    setEditingSequence((prev: any) => {
      if (!prev) return prev;
      const updatedBlocks = prev.blocks.map((b: any, idx: number) => {
        if (idx === blockIdx) {
          return { ...b, [field]: value };
        }
        return b;
      });
      return {
        ...prev,
        blocks: updatedBlocks
      };
    });
  };

  const addBlock = () => {
    setEditingSequence((prev: any) => {
      if (!prev) return prev;
      const nextNum = (prev.blocks || []).length + 1;
      const newBlock = {
        id: `blk-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        title: `Bloque ${nextNum}`,
        blockNumber: nextNum,
        description: '',
        activities: []
      };
      const updatedBlocks = [...(prev.blocks || []), newBlock];
      
      // Delay opening to let state resolve
      setTimeout(() => {
        setOpenBlockIdx(updatedBlocks.length - 1);
      }, 0);

      return {
        ...prev,
        blocks: updatedBlocks
      };
    });
    toast.success('Nuevo bloque agregado');
  };

  const removeBlock = (blockIdx: number) => {
    setEditingSequence((prev: any) => {
      if (!prev) return prev;
      const updatedBlocks = prev.blocks
        .filter((_: any, idx: number) => idx !== blockIdx)
        .map((b: any, idx: number) => ({
          ...b,
          blockNumber: idx + 1
        }));
      return {
        ...prev,
        blocks: updatedBlocks
      };
    });
    setOpenBlockIdx(null);
    toast.success('Bloque eliminado');
  };

  const updateActivity = (blockIdx: number, actIdx: number, field: string, value: any) => {
    setEditingSequence((prev: any) => {
      if (!prev) return prev;
      const updatedBlocks = prev.blocks.map((b: any, bIdx: number) => {
        if (bIdx === blockIdx) {
          const updatedActs = b.activities.map((act: any, aIdx: number) => {
            if (aIdx === actIdx) {
              return { ...act, [field]: value };
            }
            return act;
          });
          return { ...b, activities: updatedActs };
        }
        return b;
      });
      return {
        ...prev,
        blocks: updatedBlocks
      };
    });
  };

  const addActivity = (blockIdx: number) => {
    setEditingSequence((prev: any) => {
      if (!prev) return prev;
      let newActIndex = 0;
      const updatedBlocks = prev.blocks.map((b: any, bIdx: number) => {
        if (bIdx === blockIdx) {
          const nextNum = (b.activities || []).length + 1;
          newActIndex = nextNum - 1;
          const newAct = {
            id: `act-${Date.now()}-${Math.round(Math.random() * 1000)}`,
            title: `Actividad ${nextNum}`,
            pedagogicalIntention: '',
            resources: '',
            homework: '',
            moments: [
              { titulo: 'Momento 1: Inicio', description: '' },
              { titulo: 'Momento 2: Desarrollo', description: '' },
              { titulo: 'Momento 3: Cierre', description: '' }
            ]
          };
          return {
            ...b,
            activities: [...(b.activities || []), newAct]
          };
        }
        return b;
      });

      setTimeout(() => {
        setOpenActivityIdx(`${blockIdx}-${newActIndex}`);
      }, 0);

      return {
        ...prev,
        blocks: updatedBlocks
      };
    });
    toast.success('Nueva actividad agregada');
  };

  const removeActivity = (blockIdx: number, actIdx: number) => {
    setEditingSequence((prev: any) => {
      if (!prev) return prev;
      const updatedBlocks = prev.blocks.map((b: any, bIdx: number) => {
        if (bIdx === blockIdx) {
          const updatedActs = b.activities.filter((_: any, idx: number) => idx !== actIdx);
          return { ...b, activities: updatedActs };
        }
        return b;
      });
      return {
        ...prev,
        blocks: updatedBlocks
      };
    });
    setOpenActivityIdx(null);
    toast.success('Actividad eliminada');
  };

  const updateMoment = (blockIdx: number, actIdx: number, momIdx: number, field: string, value: any) => {
    setEditingSequence((prev: any) => {
      if (!prev) return prev;
      const updatedBlocks = prev.blocks.map((b: any, bIdx: number) => {
        if (bIdx === blockIdx) {
          const updatedActs = b.activities.map((act: any, aIdx: number) => {
            if (aIdx === actIdx) {
              const updatedMoments = act.moments.map((mom: any, mIdx: number) => {
                if (mIdx === momIdx) {
                  return { ...mom, [field]: value };
                }
                return mom;
              });
              return { ...act, moments: updatedMoments };
            }
            return act;
          });
          return { ...b, activities: updatedActs };
        }
        return b;
      });
      return {
        ...prev,
        blocks: updatedBlocks
      };
    });
  };

  // Save changes to D1
  const handleSaveToDatabase = async () => {
    if (!editingSequence) return;
    setIsLoading(true);
    try {
      await requestD1('/api/custom-sequences', 'POST', {
        id: selectedSeqId,
        subject_id: selectedSubject,
        grade_id: selectedGrade,
        content: editingSequence
      });
      toast.success('¡Secuencia guardada y sincronizada correctamente en D1!');
      fetchOverrides();
    } catch (error: any) {
      console.error('Error saving sequence:', error);
      toast.error(`Error al guardar: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Revert / Reset override
  const handleResetToDefault = async () => {
    if (!dbOverrides[selectedSeqId]) {
      // Already at default, just reset form to local JSON
      const local = LOCAL_SEQUENCES[selectedSeqId];
      if (local) {
        setEditingSequence(JSON.parse(JSON.stringify(local)));
        toast.success('Editor restaurado a valores por defecto locales.');
      }
      return;
    }

    if (!window.confirm('¿Estás seguro de que deseas eliminar la personalización de esta secuencia y volver al archivo original del código?')) {
      return;
    }

    setIsLoading(true);
    try {
      await requestD1(`/api/custom-sequences/${selectedSeqId}`, 'DELETE');
      toast.success('Personalización eliminada. Restaurado a valores de fábrica.');
      fetchOverrides();
    } catch (error: any) {
      console.error('Error resetting sequence:', error);
      toast.error(`Error al restaurar: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Download updated JSON
  const handleDownloadJson = () => {
    if (!editingSequence) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(editingSequence, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${selectedSeqId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('¡JSON descargado correctamente para Git!');
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-zinc-950 text-neutral-800 dark:text-zinc-200 flex flex-col p-4 md:p-6 gap-6 relative select-none">
      <Toaster position="top-center" richColors />

      {/* Top Header Navigation */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-zinc-900 px-6 py-5 rounded-[28px] border border-black/5 dark:border-zinc-800 shadow-xs gap-4 text-left">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            Configurar Currículo
            <span className="text-[10px] font-semibold uppercase bg-[#0046ab]/10 text-[#0046ab] dark:bg-blue-950/30 dark:text-blue-400 border border-[#0046ab]/10 px-2.5 py-0.5 rounded-full tracking-wider">
              Currículo
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
            Editor Curricular Dinámico
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSchoolYearModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-zinc-750 active:scale-[0.99] py-2.5 px-5 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer outline-hidden"
          >
            <Calendar size={14} className="text-[#0046ab] dark:text-blue-400" />
            Año Escolar
          </button>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 rounded-2xl bg-[#0046ab] hover:bg-[#003c94] active:scale-[0.99] text-white py-2.5 px-5 text-xs font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer outline-hidden"
          >
            <ArrowLeft size={14} className="text-white" />
            Volver al Panel de Administración
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full py-2">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Title Panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
            <div>
              <h1 className="text-[28px] font-bold text-[#1B1B1B] dark:text-zinc-100 tracking-tight leading-tight flex items-center gap-2">
                Editor Curricular Dinámico <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />
              </h1>
              <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Modifica los bloques de aprendizaje, intenciones, recursos y momentos sin necesidad de desplegar código.
              </p>
            </div>

            {/* Save Status Indicators */}
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-2 px-3 shadow-2xs text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
              <span className={`w-2 h-2 rounded-full ${
                activeModule === 'sequences_2nd_cycle'
                  ? (dbOverrides[selected2ndCycleSeqId] ? 'bg-indigo-500 animate-pulse' : 'bg-slate-350')
                  : (activeModule === 'sequences' ? (dbOverrides[selectedSeqId] ? 'bg-indigo-500 animate-pulse' : 'bg-slate-350') : 'bg-slate-350')
              }`} />
              {activeModule === 'sequences_2nd_cycle'
                ? (dbOverrides[selected2ndCycleSeqId] ? 'SOBREESCRITO EN D1' : 'USANDO COMPILADO (.JSON)')
                : (activeModule === 'sequences'
                  ? (dbOverrides[selectedSeqId] ? 'SOBREESCRITO EN D1' : 'USANDO COMPILADO (.JSON)')
                  : 'GESTOR DE TEMAS ACTIVO'
                )
              }
            </div>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex bg-white/60 dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 rounded-2xl p-1 shadow-2xs max-w-md text-left">
            <button
              onClick={() => setActiveModule('sequences')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer text-center border active:scale-[0.98] ${
                activeModule === 'sequences'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-900/30 text-blue-650 dark:text-blue-300 shadow-3xs'
                  : 'border-transparent text-slate-550 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              1er Ciclo
            </button>
            <button
              onClick={() => setActiveModule('sequences_2nd_cycle')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer text-center border active:scale-[0.98] ${
                activeModule === 'sequences_2nd_cycle'
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-900/30 text-purple-650 dark:text-purple-300 shadow-3xs'
                  : 'border-transparent text-slate-550 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              2do Ciclo Primaria
            </button>
            <button
              onClick={() => setActiveModule('units')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer text-center border active:scale-[0.98] ${
                activeModule === 'units'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/30 text-emerald-750 dark:text-emerald-300 shadow-3xs'
                  : 'border-transparent text-slate-550 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              Gestor de Temas
            </button>
          </div>

          {activeModule === 'sequences' ? (
            <>
              {/* Main Layout Editor grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Left Column: Sidebar de Navegación (col-span-4) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Selectors Card (Grado, Asignatura) & Search Box */}
                  <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                    {/* Grado Dropdown */}
                    <div className="relative select-none">
                      <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide pl-1">Grado</label>
                      <div
                        onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                        className="w-full mt-1.5 h-10 px-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-semibold text-xs flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 transition-all shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{getGradeIcon(selectedGrade)}</span>
                          <span>{GRADES.find(g => g.id === selectedGrade)?.name || 'Seleccionar Grado'}</span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      {showGradeDropdown && (
                        <>
                          <div className="fixed inset-0 z-45" onClick={() => setShowGradeDropdown(false)} />
                          <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                            <div className="space-y-0.5">
                              {GRADES.map(g => {
                                const isSelected = g.id === selectedGrade;
                                return (
                                  <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedGrade(g.id);
                                      const subjectSeqs = SEQUENCES_BY_GRADE_SUBJECT[g.id]?.[selectedSubject] || [];
                                      if (subjectSeqs.length > 0) {
                                        setSelectedSeqId(subjectSeqs[0].id);
                                      }
                                      setShowGradeDropdown(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-left text-xs font-semibold transition-colors ${
                                      isSelected
                                        ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white"
                                        : "text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="text-base">{getGradeIcon(g.id)}</span>
                                      <span>{g.name}</span>
                                    </span>
                                    {isSelected && <Check className="w-4 h-4 shrink-0 text-[#1B1B1B] dark:text-white" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Asignatura Dropdown */}
                    <div className="relative select-none">
                      <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide pl-1">Asignatura</label>
                      <div
                        onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                        className="w-full mt-1.5 h-10 px-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-semibold text-xs flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 transition-all shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{getSubjectIcon(selectedSubject)}</span>
                          <span>{SUBJECTS.find(s => s.id === selectedSubject)?.name || 'Seleccionar Asignatura'}</span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showSubjectDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      {showSubjectDropdown && (
                        <>
                          <div className="fixed inset-0 z-45" onClick={() => setShowSubjectDropdown(false)} />
                          <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                            <div className="space-y-0.5">
                              {SUBJECTS.map(s => {
                                const isSelected = s.id === selectedSubject;
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedSubject(s.id);
                                      const subjectSeqs = SEQUENCES_BY_GRADE_SUBJECT[selectedGrade]?.[s.id] || [];
                                      if (subjectSeqs.length > 0) {
                                        setSelectedSeqId(subjectSeqs[0].id);
                                      }
                                      setShowSubjectDropdown(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-left text-xs font-semibold transition-colors ${
                                      isSelected
                                        ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white"
                                        : "text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="text-base">{getSubjectIcon(s.id)}</span>
                                      <span>{s.name}</span>
                                    </span>
                                    {isSelected && <Check className="w-4 h-4 shrink-0 text-[#1B1B1B] dark:text-white" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Search Input */}
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide pl-1">Buscar Secuencia</label>
                      <input 
                        type="text" 
                        value={seqSearchQuery} 
                        onChange={(e) => setSeqSearchQuery(e.target.value)}
                        placeholder="Escribe para buscar..."
                        className="w-full mt-1.5 h-10 px-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-normal text-xs text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-450 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all shadow-2xs" 
                      />
                    </div>
                  </Card>

                  {/* Sequences List Card */}
                  <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-3">
                    <h3 className="font-semibold text-[12px] text-slate-600 dark:text-zinc-300 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-850 pb-2">Secuencias Disponibles</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {filteredSeqsList.length === 0 ? (
                        <p className="text-xs text-neutral-550 italic py-4 text-center">No se encontraron secuencias.</p>
                      ) : (
                        filteredSeqsList.map(seq => {
                          const isSelected = seq.id === selectedSeqId;
                          const info = getSequenceInfo(seq.id);
                          const isOverridden = !!dbOverrides[seq.id];
                          return (
                            <div
                              key={seq.id}
                              onClick={() => setSelectedSeqId(seq.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer group flex justify-between items-start gap-2 ${
                                isSelected
                                  ? 'bg-blue-50/70 border-blue-200/80 dark:bg-blue-955/20 dark:border-blue-900/50'
                                  : 'bg-white dark:bg-zinc-900 border-neutral-100 dark:border-zinc-800 hover:bg-neutral-55 dark:hover:bg-zinc-800/50'
                              }`}
                            >
                              <div className="min-w-0 flex-1 text-left">
                                <p className={`font-semibold text-xs leading-snug ${isSelected ? 'text-[#0046ab] dark:text-blue-400' : 'text-slate-800 dark:text-zinc-200'}`}>
                                  {seq.title}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[9px] font-semibold text-slate-450 dark:text-zinc-500 uppercase tracking-wider">
                                  <span>{info.blocksCount} {info.blocksCount === 1 ? 'Bloque' : 'Bloques'}</span>
                                  <span>•</span>
                                  <span>{info.activitiesCount} {info.activitiesCount === 1 ? 'Actividad' : 'Actividades'}</span>
                                </div>
                              </div>
                              {isOverridden && (
                                <span className="shrink-0 text-[8px] font-bold bg-indigo-500/10 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-md">
                                  D1
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </Card>

                  {/* Actions panel */}
                  <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-[12px] text-slate-600 dark:text-zinc-300 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-850 pb-2">Acciones de Guardado</h3>
                    
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={handleSaveToDatabase}
                        disabled={isLoading || !editingSequence}
                        className="w-full py-2.5 rounded-xl bg-[#0046ab] hover:bg-[#003685] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 border-none shadow-sm shadow-[#0046ab]/15 cursor-pointer disabled:opacity-50"
                      >
                        <Save size={14} />
                        Guardar en D1 (Producción)
                      </button>

                      <button
                        onClick={handleDownloadJson}
                        disabled={!editingSequence}
                        className="w-full py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-250 hover:bg-slate-50 dark:hover:bg-zinc-750 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <Download size={14} />
                        Descargar .json (para Git)
                      </button>

                      <button
                        onClick={handleResetToDefault}
                        disabled={isLoading}
                        className="w-full py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-950/30 text-red-650 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-955/15 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        Restaurar Valores por Defecto
                      </button>
                    </div>
                  </Card>

                </div>

                {/* Right Column: Blocks & Activities Nested Visual Editor (col-span-8) */}
                <div className="lg:col-span-8 space-y-4">
                  
                  {/* Sequence details config panel */}
                  {editingSequence && (
                    <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-850 pb-2">
                        <h3 className="font-semibold text-[12px] text-slate-600 dark:text-zinc-300 uppercase tracking-wider">Detalles de la Secuencia</h3>
                        <span className="text-[10px] font-mono text-slate-450 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-2 py-0.5 rounded-md">
                          ID: {editingSequence.id || ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Grado Asociado</label>
                          <input 
                            type="text" 
                            value={editingSequence.gradeId || ''} 
                            onChange={(e) => updateSequenceMetadata('gradeId', e.target.value)}
                            className="w-full mt-1.5 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Asignatura Asociada</label>
                          <input 
                            type="text" 
                            value={editingSequence.subjectId || ''} 
                            onChange={(e) => updateSequenceMetadata('subjectId', e.target.value)}
                            className="w-full mt-1.5 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                          />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Título de la Secuencia</label>
                          <input 
                            type="text" 
                            value={editingSequence.title || ''} 
                            onChange={(e) => updateSequenceMetadata('title', e.target.value)}
                            className="w-full mt-1.5 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                          />
                        </div>
                        <div className="w-full md:w-24">
                          <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Orden</label>
                          <input 
                            type="number" 
                            value={editingSequence.order !== undefined ? editingSequence.order : ''} 
                            onChange={(e) => updateSequenceMetadata('order', e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full mt-1.5 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                          />
                        </div>
                        <div className="w-full md:w-40">
                          <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Duración (Semanas)</label>
                          <input 
                            type="number" 
                            value={editingSequence.durationWeeks !== undefined ? editingSequence.durationWeeks : ''} 
                            onChange={(e) => updateSequenceMetadata('durationWeeks', e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full mt-1.5 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">DESCRIPCIÓN</label>
                        <textarea 
                          rows={2}
                          value={editingSequence.description || ''} 
                          onChange={(e) => updateSequenceMetadata('description', e.target.value)}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all duration-200 resize-y focus:min-h-[120px] shadow-xs" 
                        />
                      </div>
                    </Card>
                  )}
                  
                  {/* Blocks header */}
                  <div className="flex items-center justify-between bg-white dark:bg-zinc-900 px-5 py-3 rounded-2xl border border-black/5 dark:border-white/5 shadow-2xs">
                     <span className="font-bold text-[12px] text-slate-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                      <List size={16} className="text-[#0046ab]" />
                      Bloques de la Secuencia ({editingSequence?.blocks?.length || 0})
                    </span>

                    <button
                      onClick={addBlock}
                      className="py-1 px-3 rounded-lg bg-[#0046ab]/10 hover:bg-[#0046ab]/15 text-[#0046ab] dark:bg-blue-950/40 dark:text-blue-400 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all border-none cursor-pointer"
                    >
                      <Plus size={12} />
                      Agregar Bloque
                    </button>
                  </div>

                  {/* Editing Area */}
                  {editingSequence?.blocks ? (
                    <div className="space-y-3">
                      {editingSequence.blocks.map((block: any, bIdx: number) => {
                        const isBlockOpen = openBlockIdx === bIdx;
                        return (
                          <div 
                            key={block.id || bIdx} 
                            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-[0_8px_30px_rgba(0,70,171,0.12)] hover:border-[#0046ab]/20 transition-all duration-300 overflow-hidden"
                          >
                            {/* Block Bar Header */}
                            <div 
                              onClick={() => setOpenBlockIdx(isBlockOpen ? null : bIdx)}
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-955/20 transition-all select-none"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-8 h-8 rounded-full bg-[#0046ab] flex items-center justify-center font-semibold text-[11px] text-white shrink-0">
                                  {block.blockNumber}
                                </span>
                                <div className="min-w-0 text-left">
                                  <h4 className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                                    {block.title || `Bloque ${block.blockNumber}`}
                                  </h4>
                                  <p className="text-[10px] text-slate-450 dark:text-zinc-500 font-medium uppercase tracking-wide">
                                    Actividades: {block.activities?.length || 0}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBlockIdxToDelete(bIdx);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/25 rounded-lg transition-all cursor-pointer border-none bg-transparent"
                                  title="Eliminar Bloque"
                                >
                                  <Trash2 size={14} />
                                </button>
                                {isBlockOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                              </div>
                            </div>

                            {/* Block Content */}
                            {isBlockOpen && (
                              <div className="p-5 border-t border-slate-100 dark:border-zinc-850 bg-slate-50/[0.15] space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div className="md:col-span-3">
                                    <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Título del Bloque</label>
                                    <input 
                                      type="text"
                                      value={block.title || ''}
                                      onChange={(e) => updateBlock(bIdx, 'title', e.target.value)}
                                      className="w-full mt-1 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Número de Bloque</label>
                                    <input 
                                      type="number"
                                      value={block.blockNumber || ''}
                                      onChange={(e) => updateBlock(bIdx, 'blockNumber', Number(e.target.value))}
                                      className="w-full mt-1 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Descripción / Resumen de Contenidos del Bloque</label>
                                  <textarea 
                                    rows={2}
                                    value={block.description || ''}
                                    onChange={(e) => updateBlock(bIdx, 'description', e.target.value)}
                                    className="w-full mt-1 px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all duration-200 resize-y focus:min-h-[180px] shadow-xs" 
                                  />
                                </div>

                                {/* Nested Activities List */}
                                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-850">
                                  <div className="flex items-center justify-between">
                                     <span className="text-[11px] font-semibold text-slate-655 dark:text-zinc-400 uppercase tracking-wider">
                                      Actividades del Bloque {block.blockNumber}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => addActivity(bIdx)}
                                      className="py-1 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:bg-emerald-955/30 dark:text-emerald-400 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all border-none cursor-pointer"
                                    >
                                      <Plus size={10} />
                                      Agregar Actividad
                                    </button>
                                  </div>

                                  {block.activities && block.activities.length > 0 ? (
                                    <div className="space-y-2.5">
                                      {block.activities.map((act: any, actIdx: number) => {
                                        const actKey = `${bIdx}-${actIdx}`;
                                        const isActOpen = openActivityIdx === actKey;

                                        return (
                                          <div 
                                            key={act.id || actIdx}
                                            className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-[0_4px_20px_rgba(0,70,171,0.08)] hover:border-[#0046ab]/15 transition-all duration-300"
                                          >
                                            {/* Activity Header */}
                                            <div 
                                              onClick={() => setOpenActivityIdx(isActOpen ? null : actKey)}
                                              className="group flex items-center justify-between p-3.5 cursor-pointer hover:bg-[#0046ab] hover:text-white dark:hover:bg-[#0046ab] transition-all select-none"
                                            >
                                              <div className="flex items-center gap-2 min-w-0 text-left">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 group-hover:bg-white transition-colors" />
                                                <h5 className="font-semibold text-xs text-slate-800 dark:text-zinc-100 group-hover:text-white transition-colors truncate">
                                                  {act.title || `Actividad ${actIdx + 1}`}
                                                </h5>
                                              </div>

                                              <div className="flex items-center gap-1.5">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeActivity(bIdx, actIdx);
                                                  }}
                                                  className="p-1 text-slate-400 group-hover:text-white/85 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/25 rounded-md transition-all cursor-pointer border-none bg-transparent"
                                                  title="Eliminar Actividad"
                                                >
                                                  <Trash2 size={13} />
                                                </button>
                                                {isActOpen ? <ChevronDown size={16} className="text-slate-400 group-hover:text-white transition-colors" /> : <ChevronRight size={16} className="text-slate-400 group-hover:text-white transition-colors" />}
                                              </div>
                                            </div>

                                            {/* Activity Content Editor */}
                                            {isActOpen && (
                                              <div className="p-4 border-t border-slate-100 dark:border-zinc-850 bg-slate-50/[0.08] space-y-4">
                                                <div>
                                                  <label className="text-[9.5px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Título de la Actividad</label>
                                                  <input 
                                                    type="text"
                                                    value={act.title || ''}
                                                    onChange={(e) => updateActivity(bIdx, actIdx, 'title', e.target.value)}
                                                    className="w-full mt-1 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                                                  />
                                                </div>

                                                <div>
                                                  <label className="text-[9.5px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Intención Pedagógica de la Actividad</label>
                                                  <textarea 
                                                    rows={2}
                                                    value={act.pedagogicalIntention || ''}
                                                    onChange={(e) => updateActivity(bIdx, actIdx, 'pedagogicalIntention', e.target.value)}
                                                    className="w-full mt-1 px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all duration-200 resize-y focus:min-h-[180px] shadow-xs" 
                                                  />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                                  <div>
                                                    <label className="text-[9.5px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Recursos Sugeridos</label>
                                                    <input 
                                                      type="text"
                                                      value={act.resources || ''}
                                                      onChange={(e) => updateActivity(bIdx, actIdx, 'resources', e.target.value)}
                                                      placeholder="Ej: Papelógrafo, Letras móviles"
                                                      className="w-full mt-1 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                                                    />
                                                  </div>
                                                  <div>
                                                    <label className="text-[9.5px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Tarea para el Hogar</label>
                                                    <input 
                                                      type="text"
                                                      value={act.homework || ''}
                                                      onChange={(e) => updateActivity(bIdx, actIdx, 'homework', e.target.value)}
                                                      placeholder="Ej: Escribir su nombre completo en el cuaderno"
                                                      className="w-full mt-1 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                                                    />
                                                  </div>
                                                </div>

                                                {/* Moments List */}
                                                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-850">
                                                   <span className="text-[9px] font-semibold text-slate-500 dark:text-zinc-555 uppercase tracking-widest pl-0.5">
                                                    Momentos de la Actividad (Inicio, Desarrollo, Cierre)
                                                  </span>

                                                  <div className="space-y-3">
                                                    {(act.moments || []).map((mom: any, momIdx: number) => (
                                                      <div key={momIdx} className="bg-slate-50/50 dark:bg-zinc-955/25 p-3 rounded-xl border border-slate-100 dark:border-zinc-855 text-left">
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                             <span className="text-[10px] font-semibold text-indigo-655 dark:text-indigo-400 uppercase tracking-widest">
                                                            {mom.titulo || `Momento ${momIdx + 1}`}
                                                          </span>
                                                        </div>
                                                        <textarea 
                                                          rows={2}
                                                          value={mom.description || ''}
                                                          onChange={(e) => updateMoment(bIdx, actIdx, momIdx, 'description', e.target.value)}
                                                          placeholder={`Describe detalladamente el transcurso del Momento ${momIdx + 1}...`}
                                                          className="w-full mt-1 px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all duration-200 resize-y focus:min-h-[180px] shadow-xs"
                                                        />
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-center py-6 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-[11px] font-bold text-slate-400">
                                      No hay actividades creadas en este bloque.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[32px]">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0046ab] mx-auto mb-4"></div>
                      <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Cargando Secuencia didáctica...</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : activeModule === 'sequences_2nd_cycle' ? (
            <>
              {/* Main Layout Editor grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Left Column: Sidebar de Navegación (col-span-4) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Selectors Card (Grado, Asignatura) & Search Box */}
                  <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                    {/* Grado Dropdown */}
                    <div className="relative select-none">
                      <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide pl-1">Grado</label>
                      <div
                        onClick={() => setShow2ndCycleGradeDropdown(!show2ndCycleGradeDropdown)}
                        className="w-full mt-1.5 h-10 px-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-semibold text-xs flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 transition-all shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{getGradeIcon(selected2ndCycleGrade)}</span>
                          <span>
                            {selected2ndCycleGrade === 'primaria-4to' && '4to Grado de Primaria'}
                            {selected2ndCycleGrade === 'primaria-5to' && '5to Grado de Primaria'}
                            {selected2ndCycleGrade === 'primaria-6to' && '6to Grado de Primaria'}
                          </span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${show2ndCycleGradeDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      {show2ndCycleGradeDropdown && (
                        <>
                          <div className="fixed inset-0 z-45" onClick={() => setShow2ndCycleGradeDropdown(false)} />
                          <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                            <div className="space-y-0.5">
                              {[
                                { id: 'primaria-4to', name: '4to Grado de Primaria' },
                                { id: 'primaria-5to', name: '5to Grado de Primaria' },
                                { id: 'primaria-6to', name: '6to Grado de Primaria' }
                              ].map(g => {
                                const isSelected = g.id === selected2ndCycleGrade;
                                return (
                                  <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => {
                                      setSelected2ndCycleGrade(g.id);
                                      setShow2ndCycleGradeDropdown(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-left text-xs font-semibold transition-colors ${
                                      isSelected
                                        ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white"
                                        : "text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="text-base">{getGradeIcon(g.id)}</span>
                                      <span>{g.name}</span>
                                    </span>
                                    {isSelected && <Check className="w-4 h-4 shrink-0 text-[#1B1B1B] dark:text-white" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Asignatura Dropdown */}
                    <div className="relative select-none">
                      <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide pl-1">Asignatura</label>
                      <div
                        onClick={() => setShow2ndCycleSubjectDropdown(!show2ndCycleSubjectDropdown)}
                        className="w-full mt-1.5 h-10 px-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-semibold text-xs flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 transition-all shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{getSubjectIcon(selected2ndCycleSubject)}</span>
                          <span>{selected2ndCycleSubject === 'lengua' ? 'Lengua Española' : 'Matemática'}</span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${show2ndCycleSubjectDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      {show2ndCycleSubjectDropdown && (
                        <>
                          <div className="fixed inset-0 z-45" onClick={() => setShow2ndCycleSubjectDropdown(false)} />
                          <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                            <div className="space-y-0.5">
                              {[
                                { id: 'lengua', name: 'Lengua Española' },
                                { id: 'matematica', name: 'Matemática' }
                              ].map(s => {
                                const isSelected = s.id === selected2ndCycleSubject;
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => {
                                      setSelected2ndCycleSubject(s.id as 'lengua' | 'matematica');
                                      setShow2ndCycleSubjectDropdown(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-left text-xs font-semibold transition-colors ${
                                      isSelected
                                        ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white"
                                        : "text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="text-base">{getSubjectIcon(s.id)}</span>
                                      <span>{s.name}</span>
                                    </span>
                                    {isSelected && <Check className="w-4 h-4 shrink-0 text-[#1B1B1B] dark:text-white" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Search Input */}
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide pl-1">Buscar Secuencia</label>
                      <input 
                        type="text" 
                        value={seq2ndSearchQuery} 
                        onChange={(e) => setSeq2ndSearchQuery(e.target.value)}
                        placeholder="Escribe para buscar..."
                        className="w-full mt-1.5 h-10 px-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-normal text-xs text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-450 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all shadow-2xs" 
                      />
                    </div>
                  </Card>

                  {/* Sequences List Card */}
                  <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-3">
                    <h3 className="font-semibold text-[12px] text-slate-600 dark:text-zinc-300 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-850 pb-2">Secuencias Disponibles</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {filtered2ndCycleSeqsList.length === 0 ? (
                        <p className="text-xs text-neutral-550 italic py-4 text-center">No se encontraron secuencias.</p>
                      ) : (
                        filtered2ndCycleSeqsList.map(seq => {
                          const isSelected = seq.id === selected2ndCycleSeqId;
                          const info = get2ndCycleSequenceInfo(seq.id);
                          const isOverridden = !!dbOverrides[seq.id];
                          return (
                            <div
                              key={seq.id}
                              onClick={() => setSelected2ndCycleSeqId(seq.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer group flex justify-between items-start gap-2 ${
                                isSelected
                                  ? 'bg-purple-50/70 border-purple-200/80 dark:bg-purple-955/20 dark:border-purple-900/50'
                                  : 'bg-white dark:bg-zinc-900 border-neutral-100 dark:border-zinc-800 hover:bg-neutral-55 dark:hover:bg-zinc-800/50'
                              }`}
                            >
                              <div className="min-w-0 flex-1 text-left">
                                <p className={`font-semibold text-xs leading-snug ${isSelected ? 'text-[#0046ab] dark:text-blue-400' : 'text-slate-800 dark:text-zinc-200'}`}>
                                  {seq.title}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[9px] font-semibold text-slate-450 dark:text-zinc-500 uppercase tracking-wider">
                                  <span>{info.activitiesCount} {info.activitiesCount === 1 ? 'Actividad' : 'Actividades'}</span>
                                </div>
                              </div>
                              {isOverridden && (
                                <span className="shrink-0 text-[8px] font-bold bg-[#0046ab]/10 text-[#0046ab] dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-md">
                                  D1
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </Card>

                  {/* Actions Panel */}
                  <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-[12px] text-slate-600 dark:text-zinc-300 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-855 pb-2">Acciones de Guardado</h3>
                    
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={handleSave2ndCycleToDatabase}
                        disabled={isLoading || !editing2ndCycleSequence}
                        className="w-full py-2.5 rounded-xl bg-[#0046ab] hover:bg-[#003685] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 border-none shadow-sm shadow-[#0046ab]/15 cursor-pointer disabled:opacity-50"
                      >
                        <Save size={14} />
                        Guardar en D1 (Producción)
                      </button>

                      <button
                        onClick={handleDownload2ndCycleJson}
                        disabled={!editing2ndCycleSequence}
                        className="w-full py-2.5 rounded-xl bg-white dark:bg-zinc-805 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-250 hover:bg-slate-50 dark:hover:bg-zinc-750 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <Download size={14} />
                        Descargar .json (para Git)
                      </button>

                      <button
                        onClick={handleReset2ndCycleToDefault}
                        disabled={isLoading}
                        className="w-full py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-955/30 text-red-655 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-955/15 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        Restaurar Valores por Defecto
                      </button>
                    </div>
                  </Card>

                </div>

                {/* Right Column: Visual Editor (col-span-8) */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Sequence details config panel */}
                  {editing2ndCycleSequence && (
                    <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-855 pb-2">
                        <h3 className="font-semibold text-[12px] text-slate-600 dark:text-zinc-300 uppercase tracking-wider">Detalles de la Secuencia (2do Ciclo)</h3>
                        <span className="text-[10px] font-mono text-slate-450 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-2 py-0.5 rounded-md">
                          ID: {editing2ndCycleSequence.id || ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Grado Asociado</label>
                          <input 
                            type="text" 
                            value={editing2ndCycleSequence.grade_id || ''} 
                            onChange={(e) => update2ndCycleSequenceMetadata('grade_id', e.target.value)}
                            className="w-full mt-1.5 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Asignatura Asociada</label>
                          <input 
                            type="text" 
                            value={editing2ndCycleSequence.subject_id || ''} 
                            onChange={(e) => update2ndCycleSequenceMetadata('subject_id', e.target.value)}
                            className="w-full mt-1.5 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                          />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Título de la Secuencia</label>
                          <input 
                            type="text" 
                            value={editing2ndCycleSequence.title || ''} 
                            onChange={(e) => update2ndCycleSequenceMetadata('title', e.target.value)}
                            className="w-full mt-1.5 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                          />
                        </div>
                        <div className="w-full md:w-24">
                          <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Orden</label>
                          <input 
                            type="number" 
                            value={editing2ndCycleSequence.order !== undefined ? editing2ndCycleSequence.order : ''} 
                            onChange={(e) => update2ndCycleSequenceMetadata('order', e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full mt-1.5 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                          />
                        </div>
                        <div className="w-full md:w-40">
                          <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Duración (Semanas)</label>
                          <input 
                            type="number" 
                            value={editing2ndCycleSequence.durationWeeks !== undefined ? editing2ndCycleSequence.durationWeeks : ''} 
                            onChange={(e) => update2ndCycleSequenceMetadata('durationWeeks', e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full mt-1.5 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs" 
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">DESCRIPCIÓN</label>
                        <textarea 
                          rows={2}
                          value={editing2ndCycleSequence.description || ''} 
                          onChange={(e) => update2ndCycleSequenceMetadata('description', e.target.value)}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all duration-200 resize-y focus:min-h-[120px] shadow-xs" 
                        />
                      </div>
                    </Card>
                  )}

                  {/* Advanced sequence activity editor component */}
                  {editing2ndCycleSequence ? (
                    <AdvancedSequenceActivityEditor
                      activities={editing2ndCycleSequence.activities || []}
                      onChange={(newActivities) => {
                        setEditing2ndCycleSequence((prev: any) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            activities: newActivities
                          };
                        });
                      }}
                    />
                  ) : (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[32px]">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0046ab] mx-auto mb-4"></div>
                      <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Cargando Secuencia del 2do Ciclo...</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Selector bar for Units */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm text-left">
                {/* Asignatura */}
                <div className="relative select-none">
                  <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide pl-1">Asignatura</label>
                  <div
                    onClick={() => setShowUnitSubjectDropdown(!showUnitSubjectDropdown)}
                    className="w-full mt-1.5 h-11 px-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-bold text-sm flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 transition-all shadow-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{getSubjectIcon(selectedUnitSubject)}</span>
                      <span>{UNIT_SUBJECTS.find(s => s.id === selectedUnitSubject)?.name || 'Seleccionar Asignatura'}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showUnitSubjectDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  {showUnitSubjectDropdown && (
                    <>
                      <div className="fixed inset-0 z-45" onClick={() => setShowUnitSubjectDropdown(false)} />
                      <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                        <div className="space-y-0.5">
                          {UNIT_SUBJECTS.map(subject => {
                            const isSelected = subject.id === selectedUnitSubject;
                            return (
                              <button
                                key={subject.id}
                                type="button"
                                onClick={() => {
                                  setSelectedUnitSubject(subject.id);
                                  if (subject.id === 'ingles') {
                                    if (selectedUnitGrade !== '4to' && selectedUnitGrade !== '5to' && selectedUnitGrade !== '6to') {
                                      setSelectedUnitGrade('4to');
                                    }
                                  }
                                  setSelectedUnitId('');
                                  setSelectedThemeId('');
                                  setShowUnitSubjectDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors ${
                                  isSelected
                                    ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white"
                                    : "text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-base">{getSubjectIcon(subject.id)}</span>
                                  <span>{subject.name}</span>
                                </span>
                                {isSelected && <Check className="w-4 h-4 shrink-0 text-[#1B1B1B] dark:text-white" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Grado */}
                <div className="relative select-none">
                  <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide pl-1">Grado</label>
                  <div
                    onClick={() => setShowUnitGradeDropdown(!showUnitGradeDropdown)}
                    className="w-full mt-1.5 h-11 px-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-bold text-sm flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 transition-all shadow-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{getGradeIcon(selectedUnitGrade)}</span>
                      <span>{UNIT_GRADES.find(g => g.id === selectedUnitGrade)?.name || 'Seleccionar Grado'}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showUnitGradeDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  {showUnitGradeDropdown && (
                    <>
                      <div className="fixed inset-0 z-45" onClick={() => setShowUnitGradeDropdown(false)} />
                      <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-75 max-h-[360px] overflow-y-auto">
                        <div className="space-y-3">
                          {['PRIMARIA', 'SECUNDARIA'].map(lvl => {
                            const levelGrades = (selectedUnitSubject === 'ingles'
                              ? UNIT_GRADES.filter(g => g.level === lvl && (g.id === '4to' || g.id === '5to' || g.id === '6to' || g.level === 'SECUNDARIA'))
                              : UNIT_GRADES.filter(g => g.level === lvl));
                            if (levelGrades.length === 0) return null;
                            return (
                              <div key={lvl} className="space-y-1">
                                <div className="px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 bg-slate-100/70 dark:bg-zinc-800/50 rounded-lg">
                                  Nivel {lvl === 'PRIMARIA' ? 'Primario' : 'Secundario'}
                                </div>
                                {levelGrades.map(grade => {
                                  const isSelected = grade.id === selectedUnitGrade;
                                  return (
                                    <button
                                      key={grade.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedUnitGrade(grade.id);
                                        setSelectedUnitId('');
                                        setSelectedThemeId('');
                                        setShowUnitGradeDropdown(false);
                                      }}
                                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                                        isSelected
                                          ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-bold"
                                          : "text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                      }`}
                                    >
                                      <span className="flex items-center gap-2">
                                        <span className="text-sm">{getGradeIcon(grade.id)}</span>
                                        <span>{grade.name}</span>
                                      </span>
                                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#0046ab] dark:text-blue-400" />}
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Units Editor main grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Left Column: Units & Themes */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Units List */}
                  <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-850 pb-2">
                      <h3 className="font-semibold text-[12px] text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                        Unidades ({mergedUnits.length})
                      </h3>
                      <button
                        onClick={() => {
                          setUnitForm({ name: '', grade_levels: [selectedUnitGrade] });
                          setIsUnitModalOpen(true);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-[#0046ab]/10 hover:bg-[#0046ab]/15 text-[#0046ab] dark:bg-blue-950/40 dark:text-blue-400 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border-none"
                      >
                        <Plus size={10} /> Nueva Unidad
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                      {mergedUnits.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic py-4 text-center">No hay unidades registradas.</p>
                      ) : (
                        mergedUnits.map(unit => {
                          const isSelected = unit.id === selectedUnitId;
                          return (
                            <div
                              key={unit.id}
                              onClick={() => {
                                setSelectedUnitId(unit.id);
                                setSelectedThemeId('');
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer group flex justify-between items-center ${
                                isSelected
                                  ? 'bg-blue-50/70 border-blue-200/80 dark:bg-blue-955/20 dark:border-blue-900/50'
                                  : 'bg-white dark:bg-zinc-900 border-neutral-100 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-800/50'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <p className={`font-bold text-xs truncate ${isSelected ? 'text-[#0046ab] dark:text-blue-400' : 'text-slate-850 dark:text-zinc-200'}`}>
                                  {unit.name}
                                </p>
                                {unit.grade_levels && unit.grade_levels.length > 0 && (
                                   <p className="text-[10px] text-[#0046ab] dark:text-blue-400 mt-0.5 font-semibold uppercase tracking-wider">
                                    Grados: {unit.grade_levels.join(', ')}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUnitForm({ 
                                      id: unit.id, 
                                      name: unit.name, 
                                      grade_levels: unit.grade_levels && unit.grade_levels.length > 0 ? [...unit.grade_levels] : [selectedUnitGrade] 
                                    });
                                    setIsUnitModalOpen(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer border-none bg-transparent"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUnitToDelete(unit.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/35 cursor-pointer border-none bg-transparent"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </Card>

                  {/* Themes list for selected unit */}
                  {selectedUnit && (
                    <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-850 pb-2">
                        <h3 className="font-semibold text-[12px] text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                          Temas ({selectedUnit.themes?.length || 0})
                        </h3>
                        <button
                          onClick={() => {
                            setThemeForm({ name: '' });
                            setIsThemeModalOpen(true);
                          }}
                          className="py-1 px-2.5 rounded-lg bg-[#0046ab]/10 hover:bg-[#0046ab]/15 text-[#0046ab] dark:bg-blue-955/40 dark:text-blue-400 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border-none"
                        >
                          <Plus size={10} /> Nuevo Tema
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                        {(!selectedUnit.themes || selectedUnit.themes.length === 0) ? (
                          <p className="text-xs text-neutral-500 italic py-4 text-center">No hay temas en esta unidad.</p>
                        ) : (
                          selectedUnit.themes.map((theme, tIdx) => {
                            return (
                              <ThemeItem
                                key={theme.id}
                                theme={theme}
                                isSelected={theme.id === selectedThemeId}
                                onClick={() => setSelectedThemeId(theme.id === selectedThemeId ? '' : theme.id)}
                                onEdit={() => {
                                  setThemeForm({ id: theme.id, name: theme.name });
                                  setIsThemeModalOpen(true);
                                }}
                                onDelete={() => setThemeToDelete(theme.id)}
                                onMoveUp={() => handleMoveTheme(theme.id, 'up')}
                                onMoveDown={() => handleMoveTheme(theme.id, 'down')}
                                isFirst={tIdx === 0}
                                isLast={tIdx === selectedUnit.themes.length - 1}
                              />
                            );
                          })
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Subthemes list for selected theme */}
                  {selectedTheme && (
                    <Card className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-850 pb-2">
                        <h3 className="font-display font-semibold text-[12px] text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                          Subtemas ({selectedTheme.subthemes?.length || 0})
                        </h3>
                        <button
                          onClick={() => {
                            setSubthemeForm({ name: '' });
                            setIsSubthemeModalOpen(true);
                          }}
                          className="py-1 px-2.5 rounded-lg bg-[#0046ab]/10 hover:bg-[#0046ab]/15 text-[#0046ab] dark:bg-blue-955/40 dark:text-blue-400 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border-none"
                        >
                          <Plus size={10} /> Nuevo Subtema
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                        {(!selectedTheme.subthemes || selectedTheme.subthemes.length === 0) ? (
                          <p className="text-xs text-neutral-500 italic py-4 text-center">No hay subtemas en este tema.</p>
                        ) : (
                          selectedTheme.subthemes.map(subtheme => (
                            <div
                              key={subtheme.id}
                              className="p-3 rounded-xl border bg-white dark:bg-zinc-900 border-neutral-100 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-800/50 flex justify-between items-center group"
                            >
                              <span className="font-semibold text-sm text-neutral-700 dark:text-zinc-305 truncate">
                                {subtheme.name}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={() => {
                                    setSubthemeForm({ id: subtheme.id, name: subtheme.name });
                                    setIsSubthemeModalOpen(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer border-none bg-transparent"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSubthemeToDelete(subtheme.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-550 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/35 cursor-pointer border-none bg-transparent"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Right Column: Curriculum Block Contents Editor */}
                <div className="lg:col-span-8">
                  {selectedUnit ? (
                    <Card className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden h-full min-h-[500px]">
                      <UnitContentEditor
                        unit={selectedUnit}
                        onSave={handleSaveBlocks}
                      />
                    </Card>
                  ) : (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 border-dashed rounded-[32px] p-8 text-center text-slate-400">
                      <BookOpen className="w-12 h-12 text-slate-300 dark:text-zinc-700 mb-3" />
                      <h4 className="font-bold text-slate-700 dark:text-zinc-350 text-sm">Selecciona una Unidad</h4>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-xs">
                        Elige una unidad del listado para ver, editar y vincular sus bloques de contenidos curriculares con los temas.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* MODALS AND CONFIRM DIALOGS */}
      <AnimatePresence>
        {/* Confirm Delete Block Modal */}
        {blockIdxToDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBlockIdxToDelete(null)}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full p-6 space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-2xl text-left"
            >
              <div className="flex items-start gap-3 border-b border-neutral-100 dark:border-zinc-850 pb-3">
                <div className="p-2 bg-red-100 dark:bg-red-955/30 text-red-650 rounded-xl shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-red-650 dark:text-red-400">
                    ¿Eliminar bloque de aprendizaje?
                  </h3>
                  <p className="text-xs text-neutral-550 dark:text-zinc-400 font-semibold mt-0.5 leading-relaxed">
                    Esta acción es irreversible y eliminará el bloque <strong>"{editingSequence?.blocks?.[blockIdxToDelete]?.title || `Bloque ${blockIdxToDelete + 1}`}"</strong> junto con todas las actividades asociadas a él.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => setBlockIdxToDelete(null)}
                  className="px-4 py-2 border border-neutral-200 dark:border-zinc-700 text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:bg-neutral-55/60 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer select-none"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (blockIdxToDelete !== null) {
                      removeBlock(blockIdxToDelete);
                      setBlockIdxToDelete(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm select-none"
                >
                  Eliminar Bloque
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Unit Form Modal */}
        {isUnitModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsUnitModalOpen(false)}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full p-6 space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-850 pb-3">
                <h3 className="font-display font-bold text-base text-neutral-900 dark:text-zinc-100">
                  {unitForm.id ? 'Editar Unidad' : 'Nueva Unidad'}
                </h3>
                <button
                  onClick={() => setIsUnitModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:text-zinc-500 dark:hover:text-zinc-350 dark:hover:bg-zinc-800 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Nombre de la Unidad</label>
                  <input
                    type="text"
                    value={unitForm.name}
                    onChange={(e) => setUnitForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Los seres vivos y su entorno"
                    className="w-full mt-1 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide mb-2">Grados Aplicables</label>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {['INICIAL', 'PRIMARIA', 'SECUNDARIA'].map(level => {
                      const levelGrades = AVAILABLE_GRADES.filter(g => g.level === level);
                      if (levelGrades.length === 0) return null;
                      return (
                        <div key={level}>
                           <p className="text-[10px] font-semibold text-neutral-450 dark:text-zinc-555 uppercase tracking-wider mb-2">{level}</p>
                          <div className="flex flex-wrap gap-2">
                            {levelGrades.map(grade => {
                              const isSelected = unitForm.grade_levels?.includes(grade.value);
                              return (
                                <button
                                  type="button"
                                  key={grade.value}
                                  onClick={() => {
                                    setUnitForm(prev => {
                                      const exists = prev.grade_levels?.includes(grade.value) || false;
                                      const next = exists
                                        ? prev.grade_levels.filter(g => g !== grade.value)
                                        : [...(prev.grade_levels || []), grade.value];
                                      return { ...prev, grade_levels: next };
                                    });
                                  }}
                                  className={`px-3 py-1.5 text-xs rounded-full border cursor-pointer transition-all ${
                                    isSelected
                                      ? 'bg-blue-50 border-blue-200 text-[#0046ab] dark:bg-blue-955/20 dark:border-blue-900/50 dark:text-blue-400 font-bold'
                                      : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
                                  }`}
                                >
                                  {grade.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-2 font-medium">
                    La unidad será visible para planificaciones de los grados seleccionados.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 dark:border-zinc-700 text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:bg-neutral-55 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUnitForm}
                  className="px-4 py-2 bg-[#0046ab] hover:bg-[#00388a] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Guardar Unidad
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Theme Form Modal */}
        {isThemeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsThemeModalOpen(false)}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full p-6 space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-850 pb-3">
                <h3 className="font-display font-bold text-base text-neutral-900 dark:text-zinc-100">
                  {themeForm.id ? 'Editar Tema' : 'Nuevo Tema'}
                </h3>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Nombre del Tema</label>
                <input
                  type="text"
                  value={themeForm.name}
                  onChange={(e) => setThemeForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Orientación Espacial y Mapas"
                  className="w-full mt-1 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs"
                />
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => setIsThemeModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 dark:border-zinc-700 text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:bg-neutral-55 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveThemeForm}
                  className="px-4 py-2 bg-[#0046ab] hover:bg-[#00388a] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Guardar Tema
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Subtheme Form Modal */}
        {isSubthemeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSubthemeModalOpen(false)}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
                        <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full p-6 space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-850 pb-3">
                <h3 className="font-display font-bold text-base text-neutral-900 dark:text-zinc-100">
                  {subthemeForm.id ? 'Editar Subtema' : 'Nuevo Subtema'}
                </h3>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide">Nombre del Subtema</label>
                <input
                  type="text"
                  value={subthemeForm.name}
                  onChange={(e) => setSubthemeForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Los Puntos Cardinales"
                  className="w-full mt-1 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs"
                />
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => setIsSubthemeModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 dark:border-zinc-700 text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:bg-neutral-55 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveSubthemeForm}
                  className="px-4 py-2 bg-[#0046ab] hover:bg-[#00388a] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Guardar Subtema
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Unit Confirmation Modal */}
        {unitToDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUnitToDelete(null)}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full p-6 space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-2xl text-left"
            >
              <div className="flex items-start gap-3 border-b border-neutral-100 dark:border-zinc-850 pb-3">
                <div className="p-2 bg-red-100 dark:bg-red-955/30 text-red-650 rounded-xl shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-650" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-red-650 dark:text-red-400">
                    ¿Eliminar Unidad de Aprendizaje?
                  </h3>
                  <p className="text-xs text-neutral-550 dark:text-zinc-400 font-semibold mt-0.5 leading-relaxed">
                    Esta acción eliminará o marcará como eliminada la unidad seleccionada. No se mostrará en los selectores del Planificador.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => setUnitToDelete(null)}
                  className="px-4 py-2 border border-neutral-200 dark:border-zinc-700 text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:bg-neutral-55 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (unitToDelete) {
                      await deleteUnitFromD1(unitToDelete);
                      setUnitToDelete(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-650 hover:bg-red-750 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Eliminar Unidad
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Theme Confirmation Modal */}
        {themeToDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setThemeToDelete(null)}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full p-6 space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-2xl text-left"
            >
              <div className="flex items-start gap-3 border-b border-neutral-100 dark:border-zinc-850 pb-3">
                <div className="p-2 bg-red-100 dark:bg-red-955/30 text-red-650 rounded-xl shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-650" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-red-650 dark:text-red-400">
                    ¿Eliminar Tema?
                  </h3>
                  <p className="text-xs text-neutral-550 dark:text-zinc-400 font-semibold mt-0.5 leading-relaxed">
                    Esta acción eliminará el tema seleccionado y todos sus subtemas. Los bloques vinculados perderán la vinculación con este tema.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => setThemeToDelete(null)}
                  className="px-4 py-2 border border-neutral-200 dark:border-zinc-700 text-xs font-bold text-neutral-650 dark:text-neutral-350 hover:bg-neutral-55 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (themeToDelete) {
                      await handleDeleteTheme(themeToDelete);
                      setThemeToDelete(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-650 hover:bg-red-750 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Eliminar Tema
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Subtheme Confirmation Modal */}
        {subthemeToDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSubthemeToDelete(null)}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full p-6 space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-2xl text-left"
            >
              <div className="flex items-start gap-3 border-b border-neutral-100 dark:border-zinc-850 pb-3">
                <div className="p-2 bg-red-100 dark:bg-red-955/30 text-red-650 rounded-xl shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-650" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-red-650 dark:text-red-400">
                    ¿Eliminar Subtema?
                  </h3>
                  <p className="text-xs text-neutral-550 dark:text-zinc-400 font-semibold mt-0.5 leading-relaxed">
                    ¿Estás seguro de que deseas eliminar este subtema de forma permanente?
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => setSubthemeToDelete(null)}
                  className="px-4 py-2 border border-neutral-200 dark:border-zinc-700 text-xs font-bold text-neutral-650 dark:text-neutral-350 hover:bg-neutral-55 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (subthemeToDelete) {
                      await handleDeleteSubtheme(subthemeToDelete);
                      setSubthemeToDelete(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-650 hover:bg-red-750 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Eliminar Subtema
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* School Year Config Modal */}
        {isSchoolYearModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSchoolYearModalOpen(false)}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full p-6 space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-850 pb-3">
                <h3 className="font-display font-bold text-base text-neutral-900 dark:text-zinc-100 flex items-center gap-2">
                  <Calendar size={18} className="text-[#0046ab]" />
                  Configurar Año Escolar Lectivo Activo
                </h3>
                <button
                  onClick={() => setIsSchoolYearModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-655 hover:bg-slate-50 dark:text-zinc-500 dark:hover:text-zinc-355 dark:hover:bg-zinc-800 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-zinc-500 tracking-wide pl-1">Año Lectivo Activo</label>
                  <input
                    type="text"
                    value={schoolYearInput}
                    onChange={(e) => setSchoolYearInput(e.target.value)}
                    placeholder="Ej: 2025-2026"
                    className="w-full mt-1.5 h-11 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-sm text-neutral-700 dark:text-neutral-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs"
                  />
                  <p className="text-[10px] text-neutral-450 dark:text-zinc-500 mt-2 font-medium">
                    Establece el año escolar lectivo por defecto en la plataforma. Afectará la creación de nuevas aulas y visualización en el aula virtual.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => setIsSchoolYearModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 dark:border-zinc-700 text-xs font-bold text-neutral-600 dark:text-neutral-355 hover:bg-neutral-55 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveSchoolYear}
                  className="px-4 py-2 bg-[#0046ab] hover:bg-[#00388a] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Establecer Año Escolar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
