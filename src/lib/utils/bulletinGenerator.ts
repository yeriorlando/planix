import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Generador de Boletines PDF — Plantillas Oficiales MINERD
 * 
 * Migrado desde: Planix 2,0 MUESTRA → app/(dashboard)/dashboard/estudiantes/registro/[id]/boletines/page.tsx
 * Adaptado para localStorage (learning-management-app)
 * 
 * Flujo:
 * 1. Detecta grado del aula (1er-6to Primaria)
 * 2. Carga la plantilla PDF correspondiente desde /templates/
 * 3. Lee calificaciones de localStorage (plx:official_grades)
 * 4. Lee asistencia de localStorage (plx:attendance)
 * 5. Inyecta datos en la página 2 del PDF usando coordenadas exactas
 * 6. Descarga el PDF generado
 */

export async function generateBulletinsPDF(
  classroom: any,
  studentId: string | "ALL"
): Promise<{ success: boolean; error?: string }> {
  try {
    const classroomId = classroom.id;
    const allStr = `${classroom.nivel || ""} ${classroom.grado || ""} ${classroom.nombre || ""}`.toLowerCase();
    const isPrimaria = allStr.includes("primari");

    // Detectar grado desde el string del aula
    let detectedGrade = 0;
    if (/1er|1ro|primer/i.test(allStr)) detectedGrade = 1;
    else if (/2do|2ndo|segund/i.test(allStr)) detectedGrade = 2;
    else if (/3er|3ro|tercer/i.test(allStr)) detectedGrade = 3;
    else if (/4to|cuart/i.test(allStr)) detectedGrade = 4;
    else if (/5to|quint/i.test(allStr)) detectedGrade = 5;
    else if (/6to|sext/i.test(allStr)) detectedGrade = 6;

    // Mapa de plantillas disponibles (idéntico a Planix 2,0 MUESTRA)
    const templateMap: Record<number, string> = {
      1: "/templates/Boletin_calificaciones_1ero_primaria.pdf",
      2: "/templates/Boletin_calificaciones_2do_primaria.pdf",
      3: "/templates/Boletin_calificaciones_3ero_primaria.pdf",
      4: "/templates/Boletin_calificaciones_4to_primaria.pdf",
      5: "/templates/Boletin_calificaciones_5to_primaria.pdf",
      6: "/templates/Boletin_calificaciones_6to_primaria.pdf",
    };

    if (!isPrimaria || !templateMap[detectedGrade]) {
      return {
        success: false,
        error: "PLANTILLA_NO_DISPONIBLE",
      };
    }

    const templatePath = templateMap[detectedGrade];
    console.log(`[Boletín] Grado detectado: ${detectedGrade}, Plantilla: ${templatePath}`);

    // 1. Fetch students from localStorage
    const allStudents = JSON.parse(localStorage.getItem("plx:students") || "[]");
    const students = allStudents.filter((s: any) => s.classroom_id === classroomId);

    const studentList =
      studentId === "ALL"
        ? students.sort((a: any, b: any) => (a.numero_orden || 0) - (b.numero_orden || 0))
        : students.filter((s: any) => s.id === studentId);

    if (studentList.length === 0) {
      return {
        success: false,
        error: "No hay estudiantes en este grupo para generar boletines.",
      };
    }

    console.log(`[Boletín] Procesando ${studentList.length} estudiante(s)...`);

    // 2. Fetch grades from localStorage
    const allGrades = JSON.parse(localStorage.getItem("plx:official_grades") || "[]");
    const classGrades = allGrades.filter((g: any) => g.classroom_id === classroomId);

    // 3. Fetch attendance from localStorage
    const allAttendance = JSON.parse(localStorage.getItem("plx:attendance") || "[]");
    const attendanceRecords = allAttendance.filter((r: any) => r.classroom_id === classroomId);

    // 4. Process structured data (idéntico a Planix 2,0 MUESTRA)
    const processedData: Record<string, any> = {};
    studentList.forEach((s: any) => {
      processedData[s.id] = {
        gradesBySubject: {},
        finalGrades: {},
        attendance: {
          P1: { a: 0, aus: 0 },
          P2: { a: 0, aus: 0 },
          P3: { a: 0, aus: 0 },
          P4: { a: 0, aus: 0 },
        },
      };
    });

    classGrades.forEach((g: any) => {
      if (!processedData[g.student_id]) return;
      if (!processedData[g.student_id].gradesBySubject[g.subject_id]) {
        processedData[g.student_id].gradesBySubject[g.subject_id] = {};
      }
      processedData[g.student_id].gradesBySubject[g.subject_id][g.competency_id] = {
        p1: g.p1,
        rp1: g.rp1,
        p2: g.p2,
        rp2: g.rp2,
        p3: g.p3,
        rp3: g.rp3,
        p4: g.p4,
        rp4: g.rp4,
        rpf: g.rpf,
        rpe: g.rpe,
        competency_average: g.competency_average,
      };
    });

    // Procesar asistencia por periodo
    // P1: Ago(8), Sep(9), Oct(10)  |  P2: Nov(11), Dic(12), Ene(1)
    // P3: Feb(2), Mar(3)            |  P4: Abr(4), May(5), Jun(6)
    const getPeriod = (dateStr: string): string | null => {
      if (!dateStr) return null;
      const d = new Date(dateStr + "T00:00:00");
      const m = d.getMonth() + 1; // 1-12
      if (m >= 8 && m <= 10) return "P1";
      if (m >= 11 || m === 1) return "P2";
      if (m >= 2 && m <= 3) return "P3";
      if (m >= 4 && m <= 6) return "P4";
      return null;
    };

    attendanceRecords.forEach((r: any) => {
      const period = getPeriod(r.fecha);
      if (!period) return;
      if (r.registro) {
        Object.entries(r.registro).forEach(([sId, status]) => {
          if (!processedData[sId]) return;
          const att = processedData[sId].attendance[period];
          if (!att) return;
          if (status === "P" || status === "T") {
            att.a++; // Asistencia = Presente + Tardanza
          } else if (status === "A") {
            att.aus++; // Ausencia
          }
          // Excusas (E) no se cuentan como ausencia
        });
      }
    });

    console.log("[Boletín] Descargando plantilla PDF...");

    // 5. Download PDF Template from public directory
    const response = await fetch(templatePath);
    if (!response.ok) {
      console.error(`[Boletín] Error al cargar plantilla: HTTP ${response.status} para ${templatePath}`);
      return {
        success: false,
        error: `No se pudo cargar el archivo PDF de plantilla (${response.status}). Verifica que el archivo existe en public/templates/`,
      };
    }
    const pdfBytes = await response.arrayBuffer();
    console.log(`[Boletín] Plantilla cargada: ${pdfBytes.byteLength} bytes`);

    // 6. Create final merged PDF (idéntico a Planix 2,0 MUESTRA)
    const finalPdf = await PDFDocument.create();
    const font = await finalPdf.embedFont(StandardFonts.Helvetica);

    // Mapa de asignaturas con coordenadas Y para las filas del boletín
    const subjectsMap = [
      { id: "lengua-espanola", y12: 504, y36: 504 },
      { id: "matematica", y12: 477, y36: 477 },
      { id: "sociales", y12: 450, y36: 450 },
      { id: "naturales", y12: 423, y36: 423 },
      { id: "ingles", y12: null, y36: 396 },
      { id: "educacion-fisica", y12: 396, y36: 369 },
      { id: "formacion-humana", y12: 369, y36: 342 },
      { id: "educacion-artistica", y12: 342, y36: 315 },
    ];

    // Helper: obtener P individual
    const getP = (grades: any, pIndex: number) => {
      if (!grades) return "";
      const val = grades[`p${pIndex}`];
      return val !== null && val !== undefined ? String(val) : "";
    };

    // Helper: obtener RP individual
    const getRP = (grades: any, pIndex: number) => {
      if (!grades) return "";
      const val = grades[`rp${pIndex}`];
      return val !== null && val !== undefined ? String(val) : "";
    };

    // Helper: obtener P individual (para 1er-2do grado donde no hay recuperación)
    const getGrade = (grades: any, pIndex: number) => {
      if (!grades) return "";
      const val = grades[`p${pIndex}`];
      return val !== null && val !== undefined ? String(val) : "";
    };

    const getFinalGrade = (num: any) => {
      return num !== null && num !== undefined ? String(Math.round(Number(num))) : "";
    };

    const isLandscape = detectedGrade >= 3; // 3er-6to grado = horizontal con P+RP separados

    console.log(`[Boletín] Layout: ${isLandscape ? "Landscape (3er-6to)" : "Portrait (1er-2do)"}`);

    for (const student of studentList) {
      const studentDoc = await PDFDocument.load(pdfBytes);
      const sGrades = processedData[student.id];

      const [page1, page2] = await finalPdf.copyPages(studentDoc, [0, 1]);
      const fontSize = 8;

      const drawCentered = (txt: string, cellLeft: number, cellWidth: number, y: number) => {
        if (!txt) return;
        const textWidth = font.widthOfTextAtSize(txt, fontSize);
        const x = cellLeft + (cellWidth - textWidth) / 2;
        page2.drawText(txt, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
      };

      if (isLandscape) {
        // ========== LAYOUT 3er-6to GRADO (Landscape 834x654) ==========
        const cW = 20;
        const startX = 177;
        const col = (i: number) => ({ l: startX + i * cW, w: cW });

        const compCols = {
          C1: { p1: col(0), rp1: col(1), p2: col(2), rp2: col(3), p3: col(4), rp3: col(5), p4: col(6), rp4: col(7) },
          C2: { p1: col(8), rp1: col(9), p2: col(10), rp2: col(11), p3: col(12), rp3: col(13), p4: col(14), rp4: col(15) },
          C3: { p1: col(16), rp1: col(17), p2: col(18), rp2: col(19), p3: col(20), rp3: col(21), p4: col(22), rp4: col(23) },
        };

        // C1, C2, C3 promedios
        const avgCols = {
          C1: { l: 655, w: 25 },
          C2: { l: 678, w: 25 },
          C3: { l: 701, w: 25 },
        };

        // Calificación final del área y recuperación final
        const finalAreaCol = { l: 726, w: 22 };
        const finalRpCol = { l: 748, w: 22 };
        const finalRpeCol = { l: 770, w: 22 };

        subjectsMap.forEach((subj) => {
          const grades = sGrades.gradesBySubject[subj.id];
          if (!grades) return;

          if (subj.y36 === null || subj.y36 === undefined) return;
          const y = subj.y36 + 8;

          // C1: P1,RP1,P2,RP2,P3,RP3,P4,RP4
          drawCentered(getP(grades["C1"], 1), compCols.C1.p1.l, compCols.C1.p1.w, y);
          drawCentered(getRP(grades["C1"], 1), compCols.C1.rp1.l, compCols.C1.rp1.w, y);
          drawCentered(getP(grades["C1"], 2), compCols.C1.p2.l, compCols.C1.p2.w, y);
          drawCentered(getRP(grades["C1"], 2), compCols.C1.rp2.l, compCols.C1.rp2.w, y);
          drawCentered(getP(grades["C1"], 3), compCols.C1.p3.l, compCols.C1.p3.w, y);
          drawCentered(getRP(grades["C1"], 3), compCols.C1.rp3.l, compCols.C1.rp3.w, y);
          drawCentered(getP(grades["C1"], 4), compCols.C1.p4.l, compCols.C1.p4.w, y);
          drawCentered(getRP(grades["C1"], 4), compCols.C1.rp4.l, compCols.C1.rp4.w, y);

          // C2
          drawCentered(getP(grades["C2"], 1), compCols.C2.p1.l, compCols.C2.p1.w, y);
          drawCentered(getRP(grades["C2"], 1), compCols.C2.rp1.l, compCols.C2.rp1.w, y);
          drawCentered(getP(grades["C2"], 2), compCols.C2.p2.l, compCols.C2.p2.w, y);
          drawCentered(getRP(grades["C2"], 2), compCols.C2.rp2.l, compCols.C2.rp2.w, y);
          drawCentered(getP(grades["C2"], 3), compCols.C2.p3.l, compCols.C2.p3.w, y);
          drawCentered(getRP(grades["C2"], 3), compCols.C2.rp3.l, compCols.C2.rp3.w, y);
          drawCentered(getP(grades["C2"], 4), compCols.C2.p4.l, compCols.C2.p4.w, y);
          drawCentered(getRP(grades["C2"], 4), compCols.C2.rp4.l, compCols.C2.rp4.w, y);

          // C3
          drawCentered(getP(grades["C3"], 1), compCols.C3.p1.l, compCols.C3.p1.w, y);
          drawCentered(getRP(grades["C3"], 1), compCols.C3.rp1.l, compCols.C3.rp1.w, y);
          drawCentered(getP(grades["C3"], 2), compCols.C3.p2.l, compCols.C3.p2.w, y);
          drawCentered(getRP(grades["C3"], 2), compCols.C3.rp2.l, compCols.C3.rp2.w, y);
          drawCentered(getP(grades["C3"], 3), compCols.C3.p3.l, compCols.C3.p3.w, y);
          drawCentered(getRP(grades["C3"], 3), compCols.C3.rp3.l, compCols.C3.rp3.w, y);
          drawCentered(getP(grades["C3"], 4), compCols.C3.p4.l, compCols.C3.p4.w, y);
          drawCentered(getRP(grades["C3"], 4), compCols.C3.rp4.l, compCols.C3.rp4.w, y);

          // Promedios C1, C2, C3
          const c1Avg = grades["C1"]?.competency_average;
          const c2Avg = grades["C2"]?.competency_average;
          const c3Avg = grades["C3"]?.competency_average;

          drawCentered(getFinalGrade(c1Avg), avgCols.C1.l, avgCols.C1.w, y);
          drawCentered(getFinalGrade(c2Avg), avgCols.C2.l, avgCols.C2.w, y);
          drawCentered(getFinalGrade(c3Avg), avgCols.C3.l, avgCols.C3.w, y);

          // Calculate finalAreaAvg
          const compAverages = [];
          if (c1Avg !== undefined && c1Avg !== null) compAverages.push(Number(c1Avg));
          if (c2Avg !== undefined && c2Avg !== null) compAverages.push(Number(c2Avg));
          if (c3Avg !== undefined && c3Avg !== null) compAverages.push(Number(c3Avg));
          const finalAreaAvg = compAverages.length > 0 ? Math.round(compAverages.reduce((a, b) => a + b, 0) / compAverages.length) : null;

          // Final del Área
          drawCentered(getFinalGrade(finalAreaAvg), finalAreaCol.l, finalAreaCol.w, y);

          // Recuperación Final (RPF)
          let rpf: number | null = null;
          for (const compId of ["C1", "C2", "C3"]) {
            if (grades[compId]?.rpf !== undefined && grades[compId]?.rpf !== null) {
              rpf = Number(grades[compId].rpf);
            }
          }
          if (rpf !== null && rpf !== undefined) {
            drawCentered(getFinalGrade(rpf), finalRpCol.l, finalRpCol.w, y);
          }

          // Recuperación Especial (RPE)
          let rpe: number | null = null;
          for (const compId of ["C1", "C2", "C3"]) {
            if (grades[compId]?.rpe !== undefined && grades[compId]?.rpe !== null) {
              rpe = Number(grades[compId].rpe);
            }
          }
          if (rpe !== null && rpe !== undefined) {
            drawCentered(getFinalGrade(rpe), finalRpeCol.l, finalRpeCol.w, y);
          }
        });
      } else {
        // ========== LAYOUT 1er-2do GRADO (Portrait) ==========
        const pW = 37;
        const xCols = {
          C1: { p1: { l: 194, w: pW }, p2: { l: 231, w: pW }, p3: { l: 269, w: pW }, p4: { l: 306, w: pW } },
          C2: { p1: { l: 344, w: pW }, p2: { l: 381, w: pW }, p3: { l: 418, w: pW }, p4: { l: 455, w: pW } },
          C3: { p1: { l: 493, w: pW }, p2: { l: 530, w: pW }, p3: { l: 567, w: pW }, p4: { l: 605, w: pW } },
        };
        const avgW = 30.7;
        const avgCols = {
          C1: { l: 641, w: avgW },
          C2: { l: 641 + avgW, w: avgW },
          C3: { l: 641 + avgW * 2, w: avgW },
        };
        const finalAreaCol = { l: 733, w: 30 };
        const finalRpCol = { l: 763, w: 30 };

        subjectsMap.forEach((subj) => {
          const grades = sGrades.gradesBySubject[subj.id];
          if (!grades) return;

          if (subj.y12 === null || subj.y12 === undefined) return;
          const y = subj.y12 + 8;

          drawCentered(getGrade(grades["C1"], 1), xCols.C1.p1.l, xCols.C1.p1.w, y);
          drawCentered(getGrade(grades["C1"], 2), xCols.C1.p2.l, xCols.C1.p2.w, y);
          drawCentered(getGrade(grades["C1"], 3), xCols.C1.p3.l, xCols.C1.p3.w, y);
          drawCentered(getGrade(grades["C1"], 4), xCols.C1.p4.l, xCols.C1.p4.w, y);

          drawCentered(getGrade(grades["C2"], 1), xCols.C2.p1.l, xCols.C2.p1.w, y);
          drawCentered(getGrade(grades["C2"], 2), xCols.C2.p2.l, xCols.C2.p2.w, y);
          drawCentered(getGrade(grades["C2"], 3), xCols.C2.p3.l, xCols.C2.p3.w, y);
          drawCentered(getGrade(grades["C2"], 4), xCols.C2.p4.l, xCols.C2.p4.w, y);

          drawCentered(getGrade(grades["C3"], 1), xCols.C3.p1.l, xCols.C3.p1.w, y);
          drawCentered(getGrade(grades["C3"], 2), xCols.C3.p2.l, xCols.C3.p2.w, y);
          drawCentered(getGrade(grades["C3"], 3), xCols.C3.p3.l, xCols.C3.p3.w, y);
          drawCentered(getGrade(grades["C3"], 4), xCols.C3.p4.l, xCols.C3.p4.w, y);

          const c1Avg = grades["C1"]?.competency_average;
          const c2Avg = grades["C2"]?.competency_average;
          const c3Avg = grades["C3"]?.competency_average;

          drawCentered(getFinalGrade(c1Avg), avgCols.C1.l, avgCols.C1.w, y);
          drawCentered(getFinalGrade(c2Avg), avgCols.C2.l, avgCols.C2.w, y);
          drawCentered(getFinalGrade(c3Avg), avgCols.C3.l, avgCols.C3.w, y);

          // Calculate finalAreaAvg
          const compAverages = [];
          if (c1Avg !== undefined && c1Avg !== null) compAverages.push(Number(c1Avg));
          if (c2Avg !== undefined && c2Avg !== null) compAverages.push(Number(c2Avg));
          if (c3Avg !== undefined && c3Avg !== null) compAverages.push(Number(c3Avg));
          const finalAreaAvg = compAverages.length > 0 ? Math.round(compAverages.reduce((a, b) => a + b, 0) / compAverages.length) : null;

          // Final del Área
          drawCentered(getFinalGrade(finalAreaAvg), finalAreaCol.l, finalAreaCol.w, y);

          // RPF (Recuperación final) is excluded / not printed for 1st-2nd grade
        });
      }

      // ====== ASISTENCIA ======
      const att = sGrades.attendance;
      const attW = 48;
      const pctW = 49.5;

      const attRows = [
        { period: "P1", y: 98 },
        { period: "P2", y: 78 },
        { period: "P3", y: 59 },
        { period: "P4", y: 40 },
      ];

      attRows.forEach((row) => {
        const pData = att[row.period];
        const yBase = row.y + 7;
        if (pData.a > 0) drawCentered(String(pData.a), 90, attW, yBase);
        if (pData.aus > 0) drawCentered(String(pData.aus), 139, attW, yBase);
      });

      const totalA = att.P1.a + att.P2.a + att.P3.a + att.P4.a;
      const totalAus = att.P1.aus + att.P2.aus + att.P3.aus + att.P4.aus;
      const totalDays = totalA + totalAus;
      if (totalDays > 0) {
        const pctAsist = Math.round((totalA / totalDays) * 100);
        const pctAus = Math.round((totalAus / totalDays) * 100);
        drawCentered(`${pctAsist}%`, 189, pctW, 73);
        drawCentered(`${pctAus}%`, 189 + pctW, pctW, 73);
      }

      finalPdf.addPage(page1);
      finalPdf.addPage(page2);
    }

    console.log("[Boletín] Finalizando documento...");

    // Generar nombre de archivo dinámico
    const now = new Date();
    const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    const fileGradeStr = (classroom.grado || classroom.nombre || "Grado").trim();

    let studentName = "LOTE";
    if (studentId !== "ALL" && studentList.length === 1) {
      const s = studentList[0];
      studentName = `${s.nombre || ""} ${s.apellido || ""}`.trim();
    }

    const filename = `Planix - Boletin - ${fileGradeStr} - ${dateStr} - ${studentName}`;

    // Establecer metadatos del PDF
    finalPdf.setTitle(filename);
    finalPdf.setAuthor("Planix 2.0");

    // Generar y descargar PDF
    const pdfBytes2 = await finalPdf.save();
    const blob = new Blob([pdfBytes2], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    const cleanFilename = sanitizeFilename(filename);
    console.log(`[Boletín] PDF generado: ${cleanFilename}.pdf (${pdfBytes2.byteLength} bytes)`);

    // Forzar descarga directa con el nombre correcto
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${cleanFilename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpiar URL temporal después de un breve delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

    return { success: true };
  } catch (error: any) {
    console.error("[Boletín] Error generating PDF:", error);
    return {
      success: false,
      error: error.message || "Ocurrió un error inesperado al manipular el PDF.",
    };
  }
}

function sanitizeFilename(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-_]/g, "")
    .trim();
}
