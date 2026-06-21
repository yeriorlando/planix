export interface PeriodicGrade {
    p?: number | null;
    rp?: number | null;
}

/**
 * Calculates the effective grade for a period.
 * If RP exists, it replaces P.
 */
export function calculateEffectiveGrade(p?: number | null, rp?: number | null): number | null {
    if (rp !== undefined && rp !== null && !isNaN(Number(rp)) && (rp as any) !== '') return Number(rp);
    if (p !== undefined && p !== null && !isNaN(Number(p)) && (p as any) !== '') return Number(p);
    return null;
}

/**
 * Calculates the average of a competency based on available periods.
 * Follows the rule: average = sum(effective_grades) / count(available_periods)
 */
export function calculateCompetencyAverage(periods: (PeriodicGrade | null)[]): number | null {
    const effectiveGrades = periods
        .map(period => period ? calculateEffectiveGrade(period.p, period.rp) : null)
        .filter((grade): grade is number => grade !== null);

    if (effectiveGrades.length === 0) return null;

    const sum = effectiveGrades.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / effectiveGrades.length);
}

/**
 * Calculates the final area average based on available competency averages.
 */
export function calculateAreaAverage(competencyAverages: (number | null)[]): number | null {
    const averages = competencyAverages.filter((avg): avg is number => avg !== null);
    if (averages.length === 0) return null;

    const sum = averages.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / averages.length);
}

/**
 * Determines the status of a student based on their final area grade.
 * @param passingGrade - Minimum grade to pass (65 for Primaria, 70 for Secundaria)
 */
export function determineStudentStatus(finalAreaGrade: number | null, passingGrade: number = 65): 'PROMOVIDO' | 'APLAZADO' | 'PROCESO' {
    if (finalAreaGrade === null) return 'PROCESO';
    if (finalAreaGrade >= passingGrade) return 'PROMOVIDO';
    return 'APLAZADO';
}
