import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  const testColumns = ["tipo_dia", "day_type", "is_holiday", "holiday", "type_of_day", "notes", "description"];
  for (const col of testColumns) {
    const { data, error } = await supabase.from("attendance").select(col).limit(1);
    if (!error) {
      console.log(`Column '${col}' EXISTS in the table!`);
    } else {
      console.log(`Column '${col}' DOES NOT exist. Error:`, error.message);
    }
  }
}

inspect();
