import { Subject } from '../../types/subject';

export const OFFICIAL_DEFAULT_SUBJECTS: Subject[] = [
  // --- PRIMARIA ---
  {
    id: 'lengua-espanola',
    name: 'Lengua Española',
    description: 'Desarrollo de competencias comunicativas esenciales.',
    level: 'PRIMARIA',
    grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 6,
    color: '#3B82F6',
    icon: '📖'
  },
  {
    id: 'matematica',
    name: 'Matemática',
    description: 'Desarrollo del pensamiento lógico-matemático.',
    level: 'PRIMARIA',
    grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 6,
    color: '#EF4444',
    icon: '📐'
  },
  {
    id: 'sociales',
    name: 'Ciencias Sociales',
    description: 'Construcción de la identidad personal, social y nacional.',
    level: 'PRIMARIA',
    grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 6,
    color: '#F97316',
    icon: '🌍'
  },
  {
    id: 'naturales',
    name: 'Ciencias de la Naturaleza',
    description: 'Exploración y comprensión del mundo natural y físico.',
    level: 'PRIMARIA',
    grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 6,
    color: '#22C55E',
    icon: '🌿'
  },
  {
    id: 'educacion-artistica',
    name: 'Educación Artística',
    description: 'Desarrollo de la sensibilidad estética y la capacidad expresiva.',
    level: 'PRIMARIA',
    grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 4,
    color: '#D946EF',
    icon: '🎨'
  },
  {
    id: 'educacion-fisica',
    name: 'Educación Física',
    description: 'Desarrollo de capacidades psicomotoras y juego limpio.',
    level: 'PRIMARIA',
    grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 4,
    color: '#EAB308',
    icon: '⚽'
  },
  {
    id: 'formacion-humana',
    name: 'Formación H. Integral R.',
    description: 'Formación en valores éticos, morales y espirituales.',
    level: 'PRIMARIA',
    grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 4,
    color: '#8B5CF6',
    icon: '🙏'
  },
  {
    id: 'ingles',
    name: 'Lenguas Extranjeras (Inglés)',
    description: 'Desarrollo de la competencia comunicativa en lengua extranjera.',
    level: 'PRIMARIA',
    grades: ['4to', '5to', '6to'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 4,
    color: '#0EA5E9',
    icon: '🇬🇧'
  },

  // --- SECUNDARIA ---
  {
    id: 'lengua-espanola-sec',
    name: 'Lengua Española',
    description: 'Competencias de comprensión y expresión crítica en Secundaria.',
    level: 'SECUNDARIA',
    grades: ['1ro Sec', '2do Sec', '3ro Sec', '4to Sec', '5to Sec', '6to Sec'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 6,
    color: '#3B82F6',
    icon: '📖'
  },
  {
    id: 'matematica-sec',
    name: 'Matemática',
    description: 'Pensamiento abstracto, álgebra y geometría avanzada.',
    level: 'SECUNDARIA',
    grades: ['1ro Sec', '2do Sec', '3ro Sec', '4to Sec', '5to Sec', '6to Sec'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 6,
    color: '#EF4444',
    icon: '📐'
  },
  {
    id: 'sociales-sec',
    name: 'Ciencias Sociales',
    description: 'Historia universal, geografía y ciudadanía crítica.',
    level: 'SECUNDARIA',
    grades: ['1ro Sec', '2do Sec', '3ro Sec', '4to Sec', '5to Sec', '6to Sec'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 6,
    color: '#F97316',
    icon: '🌍'
  },
  {
    id: 'naturales-sec',
    name: 'Ciencias de la Naturaleza',
    description: 'Biología, Física y Química aplicadas en Secundaria.',
    level: 'SECUNDARIA',
    grades: ['1ro Sec', '2do Sec', '3ro Sec', '4to Sec', '5to Sec', '6to Sec'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 6,
    color: '#22C55E',
    icon: '🌿'
  },
  {
    id: 'ingles',
    name: 'Inglés',
    description: 'Desarrollo de la competencia comunicativa en lengua extranjera.',
    level: 'SECUNDARIA',
    grades: ['1ro Sec', '2do Sec', '3ro Sec', '4to Sec', '5to Sec', '6to Sec'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 4,
    color: '#0EA5E9',
    icon: '🇬🇧'
  },
  {
    id: 'educacion-artistica-sec',
    name: 'Educación Artística',
    description: 'Desarrollo estético y de las artes aplicadas.',
    level: 'SECUNDARIA',
    grades: ['1ro Sec', '2do Sec', '3ro Sec', '4to Sec', '5to Sec', '6to Sec'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 4,
    color: '#D946EF',
    icon: '🎨'
  },
  {
    id: 'educacion-fisica-sec',
    name: 'Educación Física',
    description: 'Psicomotricidad, deportes y capacidades atléticas.',
    level: 'SECUNDARIA',
    grades: ['1ro Sec', '2do Sec', '3ro Sec', '4to Sec', '5to Sec', '6to Sec'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 4,
    color: '#EAB308',
    icon: '⚽'
  },
  {
    id: 'formacion-humana-sec',
    name: 'Formación H. Integral R.',
    description: 'Valores, ética y proyectos de vida comunitaria.',
    level: 'SECUNDARIA',
    grades: ['1ro Sec', '2do Sec', '3ro Sec', '4to Sec', '5to Sec', '6to Sec'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 4,
    color: '#8B5CF6',
    icon: '🙏'
  },

  // --- INICIAL ---
  {
    id: 'nivel-inicial',
    name: 'Nivel Inicial',
    description: 'Desarrollo integral basado en ámbitos de experiencia y dominios de aprendizaje.',
    level: 'INICIAL',
    grades: ['Maternal', 'Infantes', 'Párvulos', 'Pre-kínder', 'Kínder', 'Pre-primario'],
    curriculum_type: 'ADECUACION_OFICIAL',
    sequences: 0,
    color: '#FF6B9D',
    icon: '🎨'
  }
];
