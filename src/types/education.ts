// Estructura educativa del sistema dominicano (MINERD)

export type EducationLevel = 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';

export type UserRole = 'DOCENTE' | 'ADMINISTRADOR' | 'COORDINADOR' | 'ADMINISTRADOR_CURRICULO' | 'ADMINISTRADOR_LECTURA';

export type Jornada = 'MATUTINA' | 'VESPERTINA' | 'EXTENDIDA';

export type PlanStatus = 'draft' | 'final' | 'printed' | 'sent' | 'approved';

export type CurriculumType = 'CON_BASE' | 'CURRICULAR' | 'ADAPTACION_CURRICULAR' | 'ADECUACION_OFICIAL';

export type PlanningType = 'DIARIA' | 'UNIDAD' | 'MENSUAL' | 'ANUAL' | 'PROYECTO';

// Estructura de grado
export interface Grade {
    id: string;
    cycleId: string;
    name: string;
    displayName: string;
    order: number;
}

// Estructura de ciclo
export interface EducationCycle {
    id: string;
    level: EducationLevel;
    name: string;
    displayName: string;
    grades: Grade[];
    order: number;
}

// Estructura de nivel educativo
export interface EducationLevelData {
    id: EducationLevel;
    name: string;
    icon: string;
    color: string;
    cycles: EducationCycle[];
    order: number;
}

// Configuración curricular por nivel
export interface LevelCurriculumConfig {
    level: EducationLevel;
    grade?: string;
    subject?: string;

    // Características del currículo
    requiresBlocks: boolean; // Para CON BASE
    requiresTransversalAxes: boolean;
    requiresIndicators: boolean;

    // Tipos de competencias disponibles
    competencyTypes: string[];

    // Tipos de contenidos
    contentTypes: ('conceptual' | 'procedural' | 'attitudinal')[];

    // Tipos de evaluación
    evaluationTypes: string[];

    // Campos personalizados
    customFields: CustomField[];
}

// Campo personalizado
export interface CustomField {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'date' | 'checkbox';
    required: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    defaultValue?: any;
    order: number;

    // Condiciones de visibilidad
    visibleWhen?: {
        field: string;
        value: any;
    };
}

// Asignatura
export interface Subject {
    id: string;
    name: string;
    level: EducationLevel;
    grades: string[]; // IDs de grados donde aplica
    curriculumType: CurriculumType;
    color: string;
    icon: string;
    order: number;
}

// Secuencia didáctica
export interface DidacticSequence {
    id: string;
    subjectId: string;
    title: string;
    description?: string;
    level: EducationLevel;
    grade: string;
    order: number;

    // Para CON BASE
    blocks?: Block[];
}

// Bloque (para CON BASE)
export interface Block {
    id: number;
    name: string;
    activities: Activity[];
}

// Actividad (para CON BASE)
export interface Activity {
    id: string;
    blockId: number;
    title: string;
    pedagogicalIntention: string;
}

// Competencia
export interface Competency {
    id: string;
    name: string;
    type: 'fundamental' | 'specific';
    level?: EducationLevel;
    subject?: string;
    description?: string;
}

// Eje transversal
export interface TransversalAxis {
    id: string;
    name: string;
    description?: string;
}

// Indicador de logro
export interface AchievementIndicator {
    id: string;
    competencyId: string;
    description: string;
    level: EducationLevel;
    grade?: string;
}
