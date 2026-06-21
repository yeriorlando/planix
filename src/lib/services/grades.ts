import type { OfficialGradeRecord } from "../storage";
import { requestD1 } from "./d1Client";
import { calculateCompetencyAverage, calculateAreaAverage } from "../utils/gradingCalculations";

export const FRONTEND_TO_BACKEND_SUBJECTS: Record<string, string> = {
  'lengua-espanola': 'LENGUA_ESPANOLA',
  'lengua-espanola-sec': 'LENGUA_ESPANOLA',
  'matematica': 'MATEMATICA',
  'matematica-sec': 'MATEMATICA',
  'sociales': 'CIENCIAS_SOCIALES',
  'sociales-sec': 'CIENCIAS_SOCIALES',
  'naturales': 'CIENCIAS_NATURALES',
  'naturales-sec': 'CIENCIAS_NATURALES',
  'educacion-artistica': 'EDUCACION_ARTISTICA',
  'educacion-artistica-sec': 'EDUCACION_ARTISTICA',
  'educacion-fisica': 'EDUCACION_FISICA',
  'educacion-fisica-sec': 'EDUCACION_FISICA',
  'formacion-humana': 'FORMACION_HUMANA',
  'formacion-humana-sec': 'FORMACION_HUMANA',
  'ingles': 'LENGUA_EXTRANJERA_INGLES',
  'frances': 'LENGUA_EXTRANJERA_FRANCES'
};

export const BACKEND_TO_FRONTEND_SUBJECTS: Record<string, string> = {
  'LENGUA_ESPANOLA': 'lengua-espanola',
  'MATEMATICA': 'matematica',
  'CIENCIAS_SOCIALES': 'sociales',
  'CIENCIAS_NATURALES': 'naturales',
  'EDUCACION_ARTISTICA': 'educacion-artistica',
  'EDUCACION_FISICA': 'educacion-fisica',
  'FORMACION_HUMANA': 'formacion-humana',
  'LENGUA_EXTRANJERA_INGLES': 'ingles',
  'LENGUA_EXTRANJERA_FRANCES': 'frances'
};

export async function fetchOfficialGrades(
  classroomId: string,
  subjectId: string
): Promise<OfficialGradeRecord[]> {
  const dbSubjectId = FRONTEND_TO_BACKEND_SUBJECTS[subjectId] || subjectId;
  const data = await requestD1<any[]>(
    `/api/official-grades?classroom_id=${classroomId}&subject_id=${dbSubjectId}`
  );

  return (data || []).map((row: any) => ({
    student_id: row.student_id,
    classroom_id: row.classroom_id,
    subject_id: subjectId, // Keep frontend format in memory/localStorage
    competency_id: row.competency_id,
    p1: row.p1,
    rp1: row.rp1,
    p2: row.p2,
    rp2: row.rp2,
    p3: row.p3,
    rp3: row.rp3,
    p4: row.p4,
    rp4: row.rp4,
    competency_average: row.competency_average,
    academic_year: row.academic_year,
  }));
}

export async function saveOfficialGrades(
  records: OfficialGradeRecord[],
  passingGrade: number = 70
): Promise<void> {
  if (records.length === 0) return;

  // Helper to safely convert input value to number or null
  const toNum = (val: any) => {
    if (val === undefined || val === null || val === "" || isNaN(Number(val))) {
      return null;
    }
    return Number(val);
  };

  // 1. Map and calculate competency averages for each record
  const dbRecords = records.map((r) => {
    const p1 = toNum(r.p1);
    const rp1 = toNum(r.rp1);
    const p2 = toNum(r.p2);
    const rp2 = toNum(r.rp2);
    const p3 = toNum(r.p3);
    const rp3 = toNum(r.rp3);
    const p4 = toNum(r.p4);
    const rp4 = toNum(r.rp4);

    let avg = toNum(r.competency_average);
    if (avg === null) {
      avg = calculateCompetencyAverage([
        { p: p1, rp: rp1 },
        { p: p2, rp: rp2 },
        { p: p3, rp: rp3 },
        { p: p4, rp: rp4 }
      ]);
    }

    const dbSubjectId = FRONTEND_TO_BACKEND_SUBJECTS[r.subject_id] || r.subject_id;

    return {
      student_id: r.student_id,
      classroom_id: r.classroom_id,
      subject_id: dbSubjectId, // Convert to database format
      competency_id: r.competency_id,
      p1,
      rp1,
      p2,
      rp2,
      p3,
      rp3,
      p4,
      rp4,
      competency_average: avg,
      academic_year: r.academic_year,
    };
  });

  // 2. Upsert official_grades via D1
  await requestD1<any>("/api/official-grades", "POST", dbRecords);

  // 3. Compute and upsert subject summaries
  const studentSubjectMap: Record<string, { classroomId: string; subjectId: string; academicYear: string; averages: number[] }> = {};

  dbRecords.forEach((r) => {
    if (r.competency_average === null) return;
    const key = `${r.student_id}_${r.subject_id}`;
    if (!studentSubjectMap[key]) {
      studentSubjectMap[key] = {
        classroomId: r.classroom_id,
        subjectId: r.subject_id,
        academicYear: r.academic_year,
        averages: [],
      };
    }
    studentSubjectMap[key].averages.push(r.competency_average);
  });

  const summaryUpdates = Object.entries(studentSubjectMap).map(([key, data]) => {
    const studentId = key.split("_")[0];
    const areaAvg = calculateAreaAverage(data.averages);

    return {
      student_id: studentId,
      classroom_id: data.classroomId,
      subject_id: data.subjectId,
      final_area_grade: areaAvg,
      status: areaAvg !== null ? (areaAvg >= passingGrade ? "APROBADO" : "REPROBADO") : null,
      academic_year: data.academicYear,
    };
  }).filter((s) => s.final_area_grade !== null);

  if (summaryUpdates.length > 0) {
    await requestD1<any>("/api/subject-summaries", "POST", summaryUpdates);
  }
}
