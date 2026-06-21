import type { StudentEvaluation } from "../storage";
import { requestD1 } from "./d1Client";

export function calculateCompetencyLevel(score: number, level: string, isChecklist: boolean): string {
  const isSecundaria = level === "secundaria";
  let levelLabel = isSecundaria ? "Resolutivo" : "Elemental";

  if (isChecklist) {
    if (score >= 100) levelLabel = isSecundaria ? "Estratégico" : "Satisfactorio";
    else if (score >= 70) levelLabel = isSecundaria ? "Autónomo" : "Aceptable";
  } else {
    if (isSecundaria) {
      if (score >= 90) levelLabel = "Estratégico";
      else if (score >= 75) levelLabel = "Autónomo";
      else if (score >= 60) levelLabel = "Resolutivo";
      else levelLabel = "Receptivo";
    } else {
      if (score >= 90) levelLabel = "Satisfactorio";
      else if (score >= 65) levelLabel = "Aceptable";
      else levelLabel = "Elemental";
    }
  }
  return levelLabel;
}

export function serializeEvaluationFeedback(e: StudentEvaluation): string {
  const feedbackBase = e.retroalimentacion || "";
  const evalData = e.evaluaciones ? JSON.stringify(e.evaluaciones) : "{}";
  return `${feedbackBase}\n\n===PLX_EVAL_DATA===\n${evalData}`;
}

export function deserializeEvaluationFeedback(dbFeedback: string | null): { feedback: string; evaluaciones: Record<string, number> } {
  if (!dbFeedback) {
    return { feedback: "", evaluaciones: {} };
  }

  const separator = "\n\n===PLX_EVAL_DATA===\n";
  const index = dbFeedback.indexOf(separator);

  if (index === -1) {
    return { feedback: dbFeedback, evaluaciones: {} };
  }

  const feedback = dbFeedback.substring(0, index);
  const evalDataStr = dbFeedback.substring(index + separator.length);

  try {
    const evaluaciones = JSON.parse(evalDataStr);
    return { feedback, evaluaciones };
  } catch (err) {
    console.warn("Failed to parse serialized evaluation checkboxes:", err);
    return { feedback: dbFeedback, evaluaciones: {} };
  }
}

export async function fetchStudentEvaluations(rubricId: string): Promise<StudentEvaluation[]> {
  const data = await requestD1<any[]>(`/api/student-evaluations?rubric_id=${rubricId}`);

  return (data || []).map((row: any) => {
    const { feedback, evaluaciones } = deserializeEvaluationFeedback(row.feedback);
    return {
      id: row.id,
      rubric_id: row.rubric_id,
      student_id: row.student_id,
      evaluaciones,
      nota_calculada: Number(row.score) || 0,
      retroalimentacion: feedback,
      fecha: row.date,
    };
  });
}

export async function fetchAllStudentRubricEvaluations(studentId: string): Promise<StudentEvaluation[]> {
  const data = await requestD1<any[]>(`/api/student-evaluations?student_id=${studentId}`);

  return (data || []).map((row: any) => {
    const { feedback, evaluaciones } = deserializeEvaluationFeedback(row.feedback);
    return {
      id: row.id,
      rubric_id: row.rubric_id,
      student_id: row.student_id,
      evaluaciones,
      nota_calculada: Number(row.score) || 0,
      retroalimentacion: feedback,
      fecha: row.date,
    };
  });
}

export async function saveStudentEvaluation(e: StudentEvaluation, level: string = "primaria", isChecklist: boolean = false): Promise<void> {
  // We first fetch the rubric to get its type if not provided
  let subjectId = "GENERAL";
  let evalType = "RUBRIC";

  if (e.rubric_id) {
    try {
      const rubric = await requestD1<any>(`/api/rubrics/${e.rubric_id}`);
      if (rubric) {
        subjectId = rubric.subject_id || "GENERAL";
        evalType = rubric.type || "RUBRIC";
      }
    } catch (err) {
      console.warn("Failed to fetch rubric metadata for evaluation:", err);
    }
  }

  const competencyLevel = calculateCompetencyLevel(e.nota_calculada, level, isChecklist || evalType === "CHECKLIST");
  const feedbackWithData = serializeEvaluationFeedback(e);

  await requestD1<any>("/api/student-evaluations", "POST", {
    id: e.id,
    student_id: e.student_id,
    rubric_id: e.rubric_id,
    subject_id: subjectId,
    evaluation_type: evalType,
    score: e.nota_calculada,
    competency_level: competencyLevel,
    feedback: feedbackWithData,
    date: e.fecha || new Date().toISOString().split("T")[0],
  });
}

export async function deleteStudentEvaluation(id: string): Promise<void> {
  await requestD1<any>(`/api/student-evaluations/${id}`, "DELETE");
}
