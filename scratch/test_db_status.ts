import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testCharacters() {
  const chars = ["P", "A", "T", "J", "E", "F", "G", "R", "C", "I", "U", "N"];
  
  // Find student
  const { data: students } = await supabase
    .from("students")
    .select("id, classroom_id")
    .limit(1);

  if (!students || students.length === 0) {
    console.error("No student found");
    return;
  }

  const { id: studentId, classroom_id: classroomId } = students[0];
  const testDate = "2026-06-25";

  for (const char of chars) {
    const { error } = await supabase
      .from("attendance")
      .upsert({
        student_id: studentId,
        classroom_id: classroomId,
        date: testDate,
        status: char,
      }, { onConflict: "student_id,date" });

    if (error) {
      console.log(`Char '${char}': FAILED (Error: ${error.message})`);
    } else {
      console.log(`Char '${char}': ALLOWED!`);
    }
  }

  // Clean up
  await supabase
    .from("attendance")
    .delete()
    .eq("student_id", studentId)
    .eq("date", testDate);
}

testCharacters();
