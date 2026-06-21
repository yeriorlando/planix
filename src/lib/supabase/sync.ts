import { supabase } from "../supabase";
import * as classroomsService from "../services/classrooms";
import * as studentsService from "../services/students";
import * as attendanceService from "../services/attendance";
import * as rubricsService from "../services/rubrics";
import * as evaluationsService from "../services/evaluations";
import * as gradesService from "../services/grades";
import * as incidentsService from "../services/incidents";
import * as planningsService from "../services/plannings";
import { requestD1 } from "../services/d1Client";

// Helper to read from localStorage safely
function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch {
    return fallback;
  }
}

// Helper to write to localStorage safely
function writeLocal<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export async function syncUpLocalStorageToSupabase(userId: string) {
  console.log(`[Sync] Starting sync UP for user ${userId}...`);

  try {
    // 1. Sync Classrooms
    const localClassrooms = readLocal<any[]>("plx:classrooms", []);
    const userClassrooms = localClassrooms.filter((c) => c.docente_id === userId);
    for (const c of userClassrooms) {
      await classroomsService.saveClassroom(c);
    }
    const classroomIds = userClassrooms.map((c) => c.id);

    // 2. Sync Students
    const localStudents = readLocal<any[]>("plx:students", []);
    const userStudents = localStudents.filter((s) => classroomIds.includes(s.classroom_id));
    for (const s of userStudents) {
      await studentsService.saveStudent(s);
    }

    // 3. Sync Attendance
    const localAttendance = readLocal<any[]>("plx:attendance", []);
    const userAttendance = localAttendance.filter((a) => classroomIds.includes(a.classroom_id));
    for (const a of userAttendance) {
      await attendanceService.saveAttendance(a);
    }

    // 4. Sync Rubrics
    const localRubrics = readLocal<any[]>("plx:rubrics", []);
    const userRubrics = localRubrics.filter((r) => r.docente_id === userId);
    for (const r of userRubrics) {
      await rubricsService.saveRubric(r);
    }
    const rubricIds = userRubrics.map((r) => r.id);

    // 5. Sync Student Evaluations
    const localEvaluations = readLocal<any[]>("plx:evaluations", []);
    const userEvaluations = localEvaluations.filter((e) => rubricIds.includes(e.rubric_id));
    for (const e of userEvaluations) {
      const studentObj = userStudents.find((s) => s.id === e.student_id);
      const classroomObj = studentObj ? userClassrooms.find((c) => c.id === studentObj.classroom_id) : null;
      const isChecklist = userRubrics.find((r) => r.id === e.rubric_id)?.tipo === "CHECKLIST";

      await evaluationsService.saveStudentEvaluation(
        e,
        classroomObj?.nivel || "primaria",
        isChecklist
      );
    }

    // 6. Sync Anecdotal Records
    const localAnecdotals = readLocal<any[]>("plx:anecdotal", []);
    const userAnecdotals = localAnecdotals.filter((a) => classroomIds.includes(a.classroom_id));
    for (const a of userAnecdotals) {
      await incidentsService.saveAnecdotalRecord(a);
    }

    // 7. Sync Incidences
    const studentIds = userStudents.map((s) => s.id);
    const localIncidences = readLocal<any[]>("plx:incidences", []);
    const userIncidences = localIncidences.filter((i) => studentIds.includes(i.student_id));
    for (const i of userIncidences) {
      await incidentsService.saveIncidence(i);
    }

    // 8. Sync Official Grades
    const localGrades = readLocal<any[]>("plx:official_grades", []);
    const userGrades = localGrades.filter((g) => classroomIds.includes(g.classroom_id));
    const gradesBySubject: Record<string, any[]> = {};
    userGrades.forEach((g) => {
      const subKey = g.subject_id;
      if (!gradesBySubject[subKey]) gradesBySubject[subKey] = [];
      gradesBySubject[subKey].push(g);
    });

    for (const subjectGrades of Object.values(gradesBySubject)) {
      await gradesService.saveOfficialGrades(subjectGrades);
    }

    // 9. Sync Lesson Plans (Plannings)
    const localPlannings = readLocal<any[]>("plx:lesson_plans", []);
    const userPlannings = localPlannings.filter((p) => p.docente_id === userId);
    for (const p of userPlannings) {
      await planningsService.savePlanning(p);
    }

    console.log("[Sync] Sync UP complete!");
  } catch (err) {
    console.error("[Sync] Error in sync UP:", err);
    throw err;
  }
}

export async function syncDownSupabaseToLocalStorage(userId: string) {
  console.log(`[Sync] Starting sync DOWN for user ${userId}...`);

  try {
    // 1. Fetch Classrooms
    const classrooms = await classroomsService.fetchClassrooms(userId);
    const classroomIds = classrooms.map((c) => c.id);

    // Merge classrooms into local storage
    const allLocalClassrooms = readLocal<any[]>("plx:classrooms", []).filter(
      (c) => c.docente_id !== userId
    );
    writeLocal("plx:classrooms", [...allLocalClassrooms, ...classrooms]);

    // 2. Fetch Students
    const allStudents: any[] = [];
    for (const cid of classroomIds) {
      const students = await studentsService.fetchStudents(cid);
      allStudents.push(...students);
    }
    const studentIds = allStudents.map((s) => s.id);

    const allLocalStudents = readLocal<any[]>("plx:students", []).filter(
      (s) => !classroomIds.includes(s.classroom_id)
    );
    writeLocal("plx:students", [...allLocalStudents, ...allStudents]);

    // 3. Fetch Attendance
    const allAttendance: any[] = [];
    for (const cid of classroomIds) {
      const attendance = await attendanceService.fetchAttendance(cid);
      allAttendance.push(...attendance);
    }
    const allLocalAttendance = readLocal<any[]>("plx:attendance", []).filter(
      (a) => !classroomIds.includes(a.classroom_id)
    );
    writeLocal("plx:attendance", [...allLocalAttendance, ...allAttendance]);

    // 4. Fetch Rubrics
    const rubrics = await rubricsService.fetchRubrics(userId);
    const rubricIds = rubrics.map((r) => r.id);

    const allLocalRubrics = readLocal<any[]>("plx:rubrics", []).filter(
      (r) => r.docente_id !== userId
    );
    writeLocal("plx:rubrics", [...allLocalRubrics, ...rubrics]);

    // 5. Fetch Student Evaluations
    const allEvaluations: any[] = [];
    for (const rid of rubricIds) {
      const evals = await evaluationsService.fetchStudentEvaluations(rid);
      allEvaluations.push(...evals);
    }
    const allLocalEvaluations = readLocal<any[]>("plx:evaluations", []).filter(
      (e) => !rubricIds.includes(e.rubric_id)
    );
    writeLocal("plx:evaluations", [...allLocalEvaluations, ...allEvaluations]);

    // 6. Fetch Anecdotal Records
    const allAnecdotals: any[] = [];
    for (const cid of classroomIds) {
      const anecs = await incidentsService.fetchAnecdotalRecords(cid);
      allAnecdotals.push(...anecs);
    }
    const allLocalAnecdotals = readLocal<any[]>("plx:anecdotal", []).filter(
      (a) => !classroomIds.includes(a.classroom_id)
    );
    writeLocal("plx:anecdotal", [...allLocalAnecdotals, ...allAnecdotals]);

    // 7. Fetch Incidences
    const allIncidences: any[] = [];
    for (const sid of studentIds) {
      const incs = await incidentsService.fetchIncidences(sid);
      allIncidences.push(...incs);
    }
    const allLocalIncidences = readLocal<any[]>("plx:incidences", []).filter(
      (i) => !studentIds.includes(i.student_id)
    );
    writeLocal("plx:incidences", [...allLocalIncidences, ...allIncidences]);

    // 8. Fetch Official Grades
    if (classroomIds.length > 0) {
      const allGrades: any[] = [];
      for (const cid of classroomIds) {
        try {
          const gradesData = await requestD1<any[]>(`/api/official-grades?classroom_id=${cid}`);
          if (gradesData) {
            allGrades.push(...gradesData);
          }
        } catch (err) {
          console.error(`[Sync] Error fetching grades for classroom ${cid}:`, err);
        }
      }

      const grades = allGrades.map((row: any) => {
        const dbSubjectId = row.subject_id || "";
        const feSubjectId = gradesService.BACKEND_TO_FRONTEND_SUBJECTS[dbSubjectId] || dbSubjectId.toLowerCase().replace(/_/g, "-");

        return {
          student_id: row.student_id,
          classroom_id: row.classroom_id,
          subject_id: feSubjectId,
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
        };
      });

      const allLocalGrades = readLocal<any[]>("plx:official_grades", []).filter(
        (g) => !classroomIds.includes(g.classroom_id)
      );
      writeLocal("plx:official_grades", [...allLocalGrades, ...grades]);
    }

    // 9. Fetch Lesson Plans (Plannings)
    try {
      const plannings = await planningsService.fetchPlannings(userId);
      const allLocalPlannings = readLocal<any[]>("plx:lesson_plans", []).filter(
        (p) => p.docente_id !== userId
      );
      writeLocal("plx:lesson_plans", [...allLocalPlannings, ...plannings]);
    } catch (err) {
      console.error("[Sync] Error fetching plannings in sync DOWN:", err);
    }

    console.log("[Sync] Sync DOWN complete!");
  } catch (err) {
    console.error("[Sync] Error in sync DOWN:", err);
    throw err;
  }
}
