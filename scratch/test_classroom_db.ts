import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, anonKey);

async function testClassrooms() {
  console.log("Testing classrooms table in Supabase with anon key...");

  // 1. Fetch classrooms
  const { data: fetchList, error: fetchError } = await supabase
    .from("classrooms")
    .select("*")
    .limit(5);

  if (fetchError) {
    console.error("Fetch Error:", fetchError);
  } else {
    console.log("Fetched Classrooms successfully! Count:", fetchList?.length);
    console.log("Sample:", fetchList);
  }

  // 2. Try to insert/upsert a dummy classroom
  const testId = "cls_test_123456";
  const teacherId = fetchList && fetchList.length > 0 ? fetchList[0].teacher_id : "e067c29e-64d8-4f11-9a7b-3b3df829ffde"; // fallback

  const dummyClassroom = {
    id: testId,
    teacher_id: teacherId,
    name: "Clase de Prueba Automatizada",
    grade: "4to grado",
    section: "A",
    academic_year: "2025-2026",
    updated_at: new Date().toISOString()
  };

  console.log("Attempting to insert test classroom:", dummyClassroom);
  const { data: insertData, error: insertError } = await supabase
    .from("classrooms")
    .upsert(dummyClassroom)
    .select();

  if (insertError) {
    console.error("Insert/Upsert Error:", insertError);
  } else {
    console.log("Insert/Upsert Success! Row:", insertData);
  }

  // 3. Try to delete the test classroom
  console.log("Attempting to delete test classroom...");
  const { error: deleteError } = await supabase
    .from("classrooms")
    .delete()
    .eq("id", testId);

  if (deleteError) {
    console.error("Delete Error:", deleteError);
  } else {
    console.log("Delete Success!");
  }
}

testClassrooms();
