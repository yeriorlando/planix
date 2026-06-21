export interface Axis {
    id: string;
    title: string;
    concepts: string[];
    procedures?: string[];
    attitudesValues?: string[];
    grade_levels?: string[];
}

export interface AIAgentConfig {
    enabled: boolean;
    enableUnitPlanning?: boolean;
    systemPrompt: string;
    assistantId?: string;
    vectorStoreId?: string;
    files: Array<{ name: string; id: string; openai_file_id: string }>;
    toolPrompts?: Record<string, string>;
    gradePrompts?: Record<string, Record<string, string>>;
}

export interface Subject {
    id: string;
    name: string;
    description: string;
    level: string;
    grades: string[];
    curriculum_type: 'CON_BASE' | 'ADAPTACION_CURRICULAR' | 'ADECUACION_OFICIAL';
    sequences: number;
    color: string;
    icon: string;
    order?: number;
    adaptationId?: string;
    badgeColor?: string;
    axes?: Axis[];
    templateAssignments?: Record<string, string>;
    aiConfig?: AIAgentConfig;
}
