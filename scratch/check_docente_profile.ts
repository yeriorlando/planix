import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDocente() {
  console.log("Searching for profiles with email 'docente@planix.do'...");
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", "docente@planix.do");
    
  if (error) {
    console.error("Error querying profiles:", error);
    return;
  }
  
  console.log("Profiles found:", data);
}

checkDocente();
