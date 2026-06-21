// Script to migrate data from Supabase (PostgreSQL) to Cloudflare D1 (SQLite)
// Run with: npx tsx scratch/export_supabase_to_d1.ts
// Created: 2026-06-13

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Faltan las variables de entorno de Supabase en .env.local");
  console.error("Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY configuradas.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// List of tables to migrate in dependency order
const TABLES_TO_MIGRATE = [
  "profiles",
  "classrooms",
  "students",
  "attendance",
  "plannings",
  "rubrics",
  "rubric_classroom_metadata",
  "student_evaluations",
  "anecdotal_records",
  "school_incidents",
  "official_grades",
  "subject_summaries",
  "schools"
];

async function fetchAllRows(tableName: string): Promise<any[]> {
  console.log(`📥 Descargando datos de la tabla: ${tableName}...`);
  let allRows: any[] = [];
  let start = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .range(start, start + limit - 1);

    if (error) {
      console.error(`❌ Error al descargar tabla ${tableName}:`, error.message);
      throw error;
    }

    if (data && data.length > 0) {
      allRows = allRows.concat(data);
      start += limit;
      if (data.length < limit) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`✅ Descargados ${allRows.length} registros de ${tableName}.`);
  return allRows;
}

function formatVal(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "1" : "0";
  if (typeof val === "number") return val.toString();
  if (typeof val === "object") {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  }
  return `'${val.toString().replace(/'/g, "''")}'`;
}

function buildInsertStatements(tableName: string, rows: any[]): string {
  if (rows.length === 0) {
    return `-- No hay datos para la tabla ${tableName}\n\n`;
  }

  const columns = Object.keys(rows[0]);
  const columnsJoined = columns.map(c => `"${c}"`).join(", ");

  let sql = `-- ==========================================\n`;
  sql += `-- DATOS DE LA TABLA: ${tableName}\n`;
  sql += `-- ==========================================\n`;
  
  for (const row of rows) {
    const values = columns.map(col => formatVal(row[col]));
    sql += `INSERT OR REPLACE INTO "${tableName}" (${columnsJoined}) VALUES (${values.join(", ")});\n`;
  }
  
  return sql + "\n";
}

async function runMigration() {
  console.log("🚀 Iniciando exportación de datos desde Supabase a SQLite/D1...");
  
  let fullSqlScript = `-- Script de migración generado automáticamente\n`;
  fullSqlScript += `-- Generado: ${new Date().toLocaleString()}\n\n`;
  fullSqlScript += `PRAGMA foreign_keys = OFF;\n\n`;

  try {
    for (const tableName of TABLES_TO_MIGRATE) {
      const rows = await fetchAllRows(tableName);
      fullSqlScript += buildInsertStatements(tableName, rows);
    }

    fullSqlScript += `PRAGMA foreign_keys = ON;\n`;

    const outputPath = path.resolve(process.cwd(), "migrations", "seed_data.sql");
    
    // Ensure migrations directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, fullSqlScript, "utf-8");
    console.log(`\n🎉 ¡Migración completada con éxito!`);
    console.log(`💾 El script SQL se guardó en: ${outputPath}`);
    console.log(`\n👉 Para aplicar los datos a tu base de datos D1 localmente ejecuta:`);
    console.log(`   npx wrangler d1 execute planix-db --local --file=./migrations/seed_data.sql`);
    console.log(`\n👉 Para aplicar los datos en producción en Cloudflare D1 ejecuta:`);
    console.log(`   npx wrangler d1 execute planix-db --remote --file=./migrations/seed_data.sql`);

  } catch (err: any) {
    console.error("\n❌ Error durante la migración:", err.message || err);
    process.exit(1);
  }
}

runMigration();
