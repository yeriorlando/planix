// Datos maestros de la estructura educativa dominicana (MINERD)
import { EducationLevel, EducationLevelData, EducationCycle, Grade } from '../../types/education';

// Estructura completa del sistema educativo
export const EDUCATION_STRUCTURE: Record<EducationLevel, EducationLevelData> = {
    INICIAL: {
        id: 'INICIAL',
        name: 'Nivel Inicial',
        icon: '🎨',
        color: '#FF6B9D',
        order: 1,
        cycles: [
            {
                id: 'inicial-ciclo1',
                level: 'INICIAL',
                name: 'Ciclo 1',
                displayName: 'Ciclo 1 (0-3 años)',
                order: 1,
                grades: [
                    {
                        id: 'inicial-maternal',
                        cycleId: 'inicial-ciclo1',
                        name: 'Maternal',
                        displayName: 'Maternal (Párvulo I)',
                        order: 1,
                    },
                    {
                        id: 'inicial-infantes',
                        cycleId: 'inicial-ciclo1',
                        name: 'Infantes',
                        displayName: 'Infantes (Párvulo II)',
                        order: 2,
                    },
                    {
                        id: 'inicial-parvulos',
                        cycleId: 'inicial-ciclo1',
                        name: 'Párvulos',
                        displayName: 'Párvulos (Párvulo III)',
                        order: 3,
                    },
                ],
            },
            {
                id: 'inicial-ciclo2',
                level: 'INICIAL',
                name: 'Ciclo 2',
                displayName: 'Ciclo 2 (3-6 años)',
                order: 2,
                grades: [
                    {
                        id: 'inicial-prekinder',
                        cycleId: 'inicial-ciclo2',
                        name: 'Pre-kínder',
                        displayName: 'Pre-kínder',
                        order: 1,
                    },
                    {
                        id: 'inicial-kinder',
                        cycleId: 'inicial-ciclo2',
                        name: 'Kínder',
                        displayName: 'Kínder',
                        order: 2,
                    },
                    {
                        id: 'inicial-preprimario',
                        cycleId: 'inicial-ciclo2',
                        name: 'Pre-primario',
                        displayName: 'Pre-primario',
                        order: 3,
                    },
                ],
            },
        ],
    },

    PRIMARIA: {
        id: 'PRIMARIA',
        name: 'Nivel Primario',
        icon: '📚',
        color: '#3B82F6',
        order: 2,
        cycles: [
            {
                id: 'primaria-ciclo1',
                level: 'PRIMARIA',
                name: 'Ciclo 1',
                displayName: 'Ciclo 1 (1ro-3ro)',
                order: 1,
                grades: [
                    {
                        id: 'primaria-1ro',
                        cycleId: 'primaria-ciclo1',
                        name: '1ro',
                        displayName: '1er Grado (Primaria)',
                        order: 1,
                    },
                    {
                        id: 'primaria-2do',
                        cycleId: 'primaria-ciclo1',
                        name: '2do',
                        displayName: '2do Grado (Primaria)',
                        order: 2,
                    },
                    {
                        id: 'primaria-3ro',
                        cycleId: 'primaria-ciclo1',
                        name: '3ro',
                        displayName: '3er Grado (Primaria)',
                        order: 3,
                    },
                ],
            },
            {
                id: 'primaria-ciclo2',
                level: 'PRIMARIA',
                name: 'Ciclo 2',
                displayName: 'Ciclo 2 (4to-6to)',
                order: 2,
                grades: [
                    {
                        id: 'primaria-4to',
                        cycleId: 'primaria-ciclo2',
                        name: '4to',
                        displayName: '4to Grado (Primaria)',
                        order: 1,
                    },
                    {
                        id: 'primaria-5to',
                        cycleId: 'primaria-ciclo2',
                        name: '5to',
                        displayName: '5to Grado (Primaria)',
                        order: 2,
                    },
                    {
                        id: 'primaria-6to',
                        cycleId: 'primaria-ciclo2',
                        name: '6to',
                        displayName: '6to Grado (Primaria)',
                        order: 3,
                    },
                ],
            },
        ],
    },

    SECUNDARIA: {
        id: 'SECUNDARIA',
        name: 'Nivel Secundario',
        icon: '🎓',
        color: '#8B5CF6',
        order: 3,
        cycles: [
            {
                id: 'secundaria-ciclo1',
                level: 'SECUNDARIA',
                name: 'Ciclo 1',
                displayName: 'Ciclo 1 (1ro-3ro)',
                order: 1,
                grades: [
                    {
                        id: 'secundaria-1ro',
                        cycleId: 'secundaria-ciclo1',
                        name: '1ro Sec',
                        displayName: '1er Grado (Secundaria)',
                        order: 1,
                    },
                    {
                        id: 'secundaria-2do',
                        cycleId: 'secundaria-ciclo1',
                        name: '2do Sec',
                        displayName: '2do Grado (Secundaria)',
                        order: 2,
                    },
                    {
                        id: 'secundaria-3ro',
                        cycleId: 'secundaria-ciclo1',
                        name: '3ro Sec',
                        displayName: '3er Grado (Secundaria)',
                        order: 3,
                    },
                ],
            },
            {
                id: 'secundaria-ciclo2',
                level: 'SECUNDARIA',
                name: 'Ciclo 2',
                displayName: 'Ciclo 2 (4to-6to)',
                order: 2,
                grades: [
                    {
                        id: 'secundaria-4to',
                        cycleId: 'secundaria-ciclo2',
                        name: '4to Sec',
                        displayName: '4to Grado (Secundaria)',
                        order: 1,
                    },
                    {
                        id: 'secundaria-5to',
                        cycleId: 'secundaria-ciclo2',
                        name: '5to Sec',
                        displayName: '5to Grado (Secundaria)',
                        order: 2,
                    },
                    {
                        id: 'secundaria-6to',
                        cycleId: 'secundaria-ciclo2',
                        name: '6to Sec',
                        displayName: '6to Grado (Secundaria)',
                        order: 3,
                    },
                ],
            },
        ],
    },
};

export function getAllLevels(): EducationLevelData[] {
    return Object.values(EDUCATION_STRUCTURE).sort((a, b) => a.order - b.order);
}

export function getLevelById(levelId: EducationLevel): EducationLevelData | undefined {
    return EDUCATION_STRUCTURE[levelId];
}

export function getCyclesByLevel(levelId: EducationLevel): EducationCycle[] {
    const level = EDUCATION_STRUCTURE[levelId];
    return level ? level.cycles.sort((a, b) => a.order - b.order) : [];
}

export function getCycleById(cycleId: string): EducationCycle | undefined {
    for (const level of Object.values(EDUCATION_STRUCTURE)) {
        const cycle = level.cycles.find(c => c.id === cycleId);
        if (cycle) return cycle;
    }
    return undefined;
}

export function getGradesByCycle(cycleId: string): Grade[] {
    const cycle = getCycleById(cycleId);
    return cycle ? cycle.grades.sort((a, b) => a.order - b.order) : [];
}

export function getGradeById(gradeId: string): Grade | undefined {
    for (const level of Object.values(EDUCATION_STRUCTURE)) {
        for (const cycle of level.cycles) {
            const grade = cycle.grades.find(g => g.id === gradeId);
            if (grade) return grade;
        }
    }
    return undefined;
}

export function getGradesByLevel(levelId: EducationLevel): Grade[] {
    const level = EDUCATION_STRUCTURE[levelId];
    if (!level) return [];

    const grades: Grade[] = [];
    for (const cycle of level.cycles) {
        grades.push(...cycle.grades);
    }

    return grades;
}

export function getGradePath(gradeId: string): string {
    const grade = getGradeById(gradeId);
    if (!grade) return '';

    const cycle = getCycleById(grade.cycleId);
    if (!cycle) return grade.displayName;

    const level = getLevelById(cycle.level);
    if (!level) return `${cycle.displayName} > ${grade.displayName}`;

    return `${level.name} > ${cycle.displayName} > ${grade.displayName}`;
}

export function gradebelongsToLevel(gradeId: string, levelId: EducationLevel): boolean {
    const grade = getGradeById(gradeId);
    if (!grade) return false;

    const cycle = getCycleById(grade.cycleId);
    return cycle ? cycle.level === levelId : false;
}

export const AVAILABLE_GRADES = [
    { value: 'Maternal', label: 'Maternal (Párvulo I)', level: 'INICIAL' },
    { value: 'Infantes', label: 'Infantes (Párvulo II)', level: 'INICIAL' },
    { value: 'Párvulos', label: 'Párvulos (Párvulo III)', level: 'INICIAL' },
    { value: 'Pre-Kinder', label: 'Pre-Kinder', level: 'INICIAL' },
    { value: 'Kinder', label: 'Kinder', level: 'INICIAL' },
    { value: 'Pre-Primario', label: 'Pre-Primario', level: 'INICIAL' },

    { value: '1ro', label: '1er Grado (Primaria)', level: 'PRIMARIA' },
    { value: '2do', label: '2do Grado (Primaria)', level: 'PRIMARIA' },
    { value: '3ro', label: '3er Grado (Primaria)', level: 'PRIMARIA' },
    { value: '4to', label: '4to Grado (Primaria)', level: 'PRIMARIA' },
    { value: '5to', label: '5to Grado (Primaria)', level: 'PRIMARIA' },
    { value: '6to', label: '6to Grado (Primaria)', level: 'PRIMARIA' },

    { value: '1ro Sec', label: '1ro Sec (Secundaria)', level: 'SECUNDARIA' },
    { value: '2do Sec', label: '2do Sec (Secundaria)', level: 'SECUNDARIA' },
    { value: '3ro Sec', label: '3ro Sec (Secundaria)', level: 'SECUNDARIA' },
    { value: '4to Sec', label: '4to Sec (Secundaria)', level: 'SECUNDARIA' },
    { value: '5to Sec', label: '5to Sec (Secundaria)', level: 'SECUNDARIA' },
    { value: '6to Sec', label: '6to Sec (Secundaria)', level: 'SECUNDARIA' },
];
