import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpsert() {
  console.log("Testing planning upsert to Supabase...");
  
  // 1. Let's find a valid user_id from profiles table
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, email")
    .limit(1);

  if (profileError) {
    console.error("Error fetching profiles:", profileError);
    process.exit(1);
  }

  if (!profiles || profiles.length === 0) {
    console.error("No profiles found to test with.");
    process.exit(1);
  }

  const userId = profiles[0].id;
  console.log(`Using user_id: ${userId} (${profiles[0].email})`);

  // 2. Let's try to upsert a dummy planning
  const pId = `plan_test_${Math.random().toString(36).slice(2, 9)}`;
  const dbRow = {
    id: pId,
    user_id: userId,
    title: "Test Planning " + new Date().toISOString(),
    type: "CURRICULAR",
    subject_id: null,
    grade_id: null,
    status: 'Borrador',
    content: {
      id: pId,
      docente_id: userId,
      titulo: "Test Planning",
      tipo: "CURRICULAR",
      nivel: "primaria",
      grado: "1ro",
      asignatura: "Lengua Española",
      intencion_pedagogica: "Test intention",
      recursos: [],
      momentos: { inicio: "Inicio", desarrollo: "Desarrollo", cierre: "Cierre" },
      creado_en: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: false
  };

  const { data, error } = await supabase
    .from("plannings")
    .upsert(dbRow)
    .select()
    .single();

  if (error) {
    console.error("Upsert failed with error:", error);
  } else {
    console.log("Upsert succeeded! Inserted row:", data);
  }
}

testUpsert();
