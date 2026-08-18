import XLSX from "xlsx-js-style";
import { Student, uid } from "./storage";

export interface AnalyzedStudentRow {
  originalIndex: number;
  status: "NUEVO" | "ACTUALIZAR" | "SIN_CAMBIOS";
  student: Student;
  existingStudent?: Student;
  changesSummary: string[];
}

export interface ExcelAnalysisResult {
  fileName: string;
  totalRows: number;
  nuevosCount: number;
  actualizarCount: number;
  sinCambiosCount: number;
  detectedColumns: string[];
  rows: AnalyzedStudentRow[];
}

const PRIMARY_COLOR = "02327E"; // Deep Navy Blue
const HEADER_FONT_COLOR = "FFFFFF";

/**
 * Genera el estilo estándar para los encabezados de las hojas de cálculo
 */
function getHeaderStyle() {
  return {
    fill: {
      fgColor: { rgb: PRIMARY_COLOR },
    },
    font: {
      name: "Calibri",
      sz: 11,
      bold: true,
      color: { rgb: HEADER_FONT_COLOR },
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
    border: {
      top: { style: "thin", color: { rgb: "022A6B" } },
      bottom: { style: "thin", color: { rgb: "022A6B" } },
      left: { style: "thin", color: { rgb: "022A6B" } },
      right: { style: "thin", color: { rgb: "022A6B" } },
    },
  };
}

/**
 * Aplica estilos de encabezado y anchos de columna a una hoja de cálculo
 */
function applyWorksheetStyles(
  worksheet: XLSX.WorkSheet,
  colWidths: number[] = [12, 32, 10, 20, 28, 20, 28]
) {
  if (!worksheet["!ref"]) return;
  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  // Aplicar estilos a la primera fila (encabezados)
  const headerStyle = getHeaderStyle();
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: 0, c: C });
    if (worksheet[address]) {
      worksheet[address].s = headerStyle;
    }
  }

  // Estilos de filas de datos (bordes sutiles y alineación)
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });
      if (worksheet[address]) {
        worksheet[address].s = {
          font: { name: "Calibri", sz: 11, color: { rgb: "1B1B1B" } },
          alignment: {
            vertical: "center",
            horizontal: C === 0 || C === 2 ? "center" : "left",
          },
          border: {
            top: { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
            left: { style: "thin", color: { rgb: "E2E8F0" } },
            right: { style: "thin", color: { rgb: "E2E8F0" } },
          },
        };
      }
    }
  }

  // Configurar anchos de columna
  worksheet["!cols"] = colWidths.map((w) => ({ wch: w }));
  worksheet["!rows"] = [{ hpt: 28 }]; // Altura de fila de encabezado
}

/**
 * Exporta la lista actual de estudiantes a un archivo Excel con encabezados estilizados
 */
export function exportarEstudiantesExcel(students: Student[], classroomName?: string) {
  const exportData = students.map((s) => ({
    "Nro. Orden": s.numero_orden,
    "Nombre Completo": s.nombre + (s.apellido ? ` ${s.apellido}` : ""),
    "Género": s.genero,
    "RNE / Matrícula": s.rne_matricula || "N/A",
    "Nombre Tutor": s.tutor_nombre || "N/A",
    "Teléfono Tutor": s.tutor_telefono || "N/A",
    "Correo Tutor": s.email_tutor || "N/A",
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  applyWorksheetStyles(worksheet, [12, 32, 10, 20, 28, 20, 28]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");

  const cleanName = classroomName ? classroomName.replace(/\s+/g, "_") : "Estudiantes";
  const fileName = `Listado_Estudiantes_${cleanName}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}

/**
 * Descarga una plantilla oficial de importación totalmente limpia (solo encabezados)
 */
export function descargarPlantillaExcel() {
  const headers = [
    [
      "Nro. Orden",
      "Nombre Completo",
      "Género",
      "RNE / Matrícula",
      "Nombre Tutor",
      "Teléfono Tutor",
      "Correo Tutor",
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(headers);
  applyWorksheetStyles(worksheet, [12, 32, 10, 20, 28, 20, 28]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla Estudiantes");

  XLSX.writeFile(workbook, "Plantilla_Importacion_Estudiantes.xlsx");
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Analiza un archivo Excel subido, comparando con los estudiantes existentes para identificar altas y actualizaciones
 */
export async function analizarArchivoExcel(
  file: File,
  classroomId: string,
  existingStudents: Student[]
): Promise<ExcelAnalysisResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    throw new Error("El archivo no contiene ninguna hoja de cálculo válida.");
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });

  if (rawRows.length === 0) {
    throw new Error("El archivo Excel está vacío o no contiene filas de datos.");
  }

  // Detectar columnas presentes
  const detectedColumnsSet = new Set<string>();
  rawRows.forEach((r) => Object.keys(r).forEach((k) => detectedColumnsSet.add(k)));
  const detectedColumns = Array.from(detectedColumnsSet);

  let nextOrder = existingStudents.reduce(
    (max, s) => (s.numero_orden > max ? s.numero_orden : max),
    0
  ) + 1;

  const analyzedRows: AnalyzedStudentRow[] = [];
  let nuevosCount = 0;
  let actualizarCount = 0;
  let sinCambiosCount = 0;

  // Mapas para búsqueda rápida de existentes
  const existingByRne = new Map<string, Student>();
  const existingByName = new Map<string, Student>();

  existingStudents.forEach((s) => {
    if (s.rne_matricula && s.rne_matricula.trim()) {
      existingByRne.set(normalizeString(s.rne_matricula), s);
    }
    const fullName = normalizeString(`${s.nombre} ${s.apellido || ""}`);
    existingByName.set(fullName, s);
    existingByName.set(normalizeString(s.nombre), s);
  });

  rawRows.forEach((row, idx) => {
    // Extracción tolerante de campos
    const rawName =
      row["Nombre Completo"] ||
      row["Nombre completo"] ||
      row["Nombre"] ||
      row["nombre"] ||
      row["Estudiante"] ||
      row["Alumno"] ||
      "";

    if (!String(rawName).trim()) return;

    let fullName = String(rawName).trim();
    let nombre = fullName;
    let apellido = "";

    const rawApellido = row["Apellido"] || row["apellido"] || row["Apellidos"] || "";
    if (rawApellido) {
      apellido = String(rawApellido).trim();
    } else {
      // Separar nombre y apellido si viene junto
      const parts = fullName.split(" ");
      if (parts.length > 2) {
        nombre = parts.slice(0, -2).join(" ");
        apellido = parts.slice(-2).join(" ");
      } else if (parts.length === 2) {
        nombre = parts[0];
        apellido = parts[1];
      }
    }

    const rawGender = String(
      row["Género"] || row["Genero"] || row["genero"] || row["Sexo"] || row["sexo"] || "M"
    ).toUpperCase();
    const gender: "M" | "F" = rawGender.startsWith("F") ? "F" : "M";

    const rawOrder = Number(row["Nro. Orden"] || row["No. Orden"] || row["Orden"] || row["orden"]);
    const rawRne = String(
      row["RNE / Matrícula"] ||
        row["RNE/Matricula"] ||
        row["RNE"] ||
        row["rne"] ||
        row["Matrícula"] ||
        row["Matricula"] ||
        row["matricula"] ||
        ""
    ).trim();

    const rawTutor = String(
      row["Nombre Tutor"] || row["Tutor"] || row["tutor"] || row["Representante"] || ""
    ).trim();
    const rawPhone = String(
      row["Teléfono Tutor"] ||
        row["Telefono Tutor"] ||
        row["Celular Tutor"] ||
        row["Teléfono"] ||
        row["Telefono"] ||
        ""
    ).trim();
    const rawEmail = String(
      row["Correo Tutor"] ||
        row["Email Tutor"] ||
        row["Correo"] ||
        row["Email"] ||
        row["email"] ||
        ""
    ).trim();
    const rawAddress = String(row["Dirección"] || row["Direccion"] || row["direccion"] || "").trim();

    // Buscar coincidencia en alumnos existentes
    let match: Student | undefined;
    if (rawRne && rawRne !== "N/A") {
      match = existingByRne.get(normalizeString(rawRne));
    }
    if (!match) {
      match = existingByName.get(normalizeString(fullName));
    }
    if (!match && apellido) {
      match = existingByName.get(normalizeString(`${nombre} ${apellido}`));
    }

    const changesSummary: string[] = [];
    let status: "NUEVO" | "ACTUALIZAR" | "SIN_CAMBIOS" = "NUEVO";
    let targetStudent: Student;

    if (match) {
      // Estudiante existente -> Revisar si hay campos que se actualizan
      if (gender !== match.genero) {
        changesSummary.push(`Género: ${match.genero} → ${gender}`);
      }
      if (rawRne && rawRne !== "N/A" && rawRne !== (match.rne_matricula || "")) {
        changesSummary.push(`RNE: ${match.rne_matricula || "Sin RNE"} → ${rawRne}`);
      }
      if (rawTutor && rawTutor !== "N/A" && rawTutor !== (match.tutor_nombre || "")) {
        changesSummary.push(`Tutor: ${match.tutor_nombre || "Sin tutor"} → ${rawTutor}`);
      }
      if (rawPhone && rawPhone !== "N/A" && rawPhone !== (match.tutor_telefono || "")) {
        changesSummary.push(`Teléfono: ${match.tutor_telefono || "Sin tel"} → ${rawPhone}`);
      }
      if (rawEmail && rawEmail !== "N/A" && rawEmail !== (match.email_tutor || "")) {
        changesSummary.push(`Correo: ${match.email_tutor || "Sin correo"} → ${rawEmail}`);
      }
      if (rawAddress && rawAddress !== (match.direccion || "")) {
        changesSummary.push(`Dirección actualizada`);
      }

      if (changesSummary.length > 0) {
        status = "ACTUALIZAR";
        actualizarCount++;
      } else {
        status = "SIN_CAMBIOS";
        sinCambiosCount++;
      }

      targetStudent = {
        ...match,
        nombre: nombre || match.nombre,
        apellido: apellido || match.apellido,
        genero: gender || match.genero,
        rne_matricula: (rawRne && rawRne !== "N/A" ? rawRne : match.rne_matricula) || undefined,
        tutor_nombre: (rawTutor && rawTutor !== "N/A" ? rawTutor : match.tutor_nombre) || undefined,
        tutor_telefono:
          (rawPhone && rawPhone !== "N/A" ? rawPhone : match.tutor_telefono) || undefined,
        email_tutor: (rawEmail && rawEmail !== "N/A" ? rawEmail : match.email_tutor) || undefined,
        direccion: rawAddress || match.direccion || undefined,
      };
    } else {
      // Nuevo estudiante
      status = "NUEVO";
      nuevosCount++;
      changesSummary.push("Nuevo registro");

      const finalOrder = !isNaN(rawOrder) && rawOrder > 0 ? rawOrder : nextOrder++;

      targetStudent = {
        id: uid("std"),
        classroom_id: classroomId,
        nombre: nombre,
        apellido: apellido || undefined,
        numero_orden: finalOrder,
        genero: gender,
        rne_matricula: rawRne && rawRne !== "N/A" ? rawRne : undefined,
        tutor_nombre: rawTutor && rawTutor !== "N/A" ? rawTutor : undefined,
        tutor_telefono: rawPhone && rawPhone !== "N/A" ? rawPhone : undefined,
        email_tutor: rawEmail && rawEmail !== "N/A" ? rawEmail : undefined,
        direccion: rawAddress || undefined,
        creado_en: new Date().toISOString(),
      };
    }

    analyzedRows.push({
      originalIndex: idx + 1,
      status,
      student: targetStudent,
      existingStudent: match,
      changesSummary,
    });
  });

  return {
    fileName: file.name,
    totalRows: analyzedRows.length,
    nuevosCount,
    actualizarCount,
    sinCambiosCount,
    detectedColumns,
    rows: analyzedRows,
  };
}
