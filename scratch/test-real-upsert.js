import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://api.planix.do/";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function run() {
  const payload = [{
    student_id: "a8d4455e-47bb-4a47-953e-85dcd45acc96",
    classroom_id: "785faa2c-9e11-4dec-ac15-7c7d8cb8b8e7",
    subject_id: "lengua-espanola",
    competency_id: "C1",
    p1: 67,
    rp1: null,
    p2: 67,
    rp2: null,
    p3: 67,
    rp3: null,
    p4: 67,
    rp4: null,
    competency_average: 67,
    academic_year: "2025-2026",
    updated_at: new Date().toISOString()
  }];

  console.log("Using URL:", supabaseUrl);
  
  const { data, error } = await supabase
    .from("official_grades")
    .upsert(payload, { onConflict: "student_id,subject_id,competency_id,academic_year" });

  if (error) {
    console.error("Upsert failed with error:", error);
  } else {
    console.log("Upsert succeeded! Data returned:", data);
  }
}

run();
