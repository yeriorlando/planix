import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to generate a valid UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function testInsert() {
  const { data: profiles } = await supabase.from("profiles").select("id").limit(1);
  if (!profiles || profiles.length === 0) {
    console.error("No profiles found!");
    return;
  }
  const userId = profiles[0].id;
  
  const uuid = generateUUID();
  console.log(`Inserting row with ID ${uuid} and user_id ${userId}...`);
  
  const dbRow = {
    id: uuid,
    user_id: userId,
    title: "Test UUID Planning",
    type: "CURRICULAR",
    subject_id: null,
    grade_id: null,
    status: 'Borrador',
    content: {
      id: uuid,
      docente_id: userId,
      titulo: "Test UUID Planning",
      tipo: "CURRICULAR",
      nivel: "primaria",
      grado: "1ro",
      asignatura: "Lengua Española"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: false
  };

  const { data, error } = await supabase
    .from("plannings")
    .insert(dbRow)
    .select();

  if (error) {
    console.error("Insert failed with error:", error);
  } else {
    console.log("Insert succeeded!", data);
  }
}

testInsert();
