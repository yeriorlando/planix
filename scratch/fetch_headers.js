import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching sequence headers for 2do ciclo...");
  
  const { data, error } = await supabase
    .from('sequences')
    .select('id, title, grade_id, subject_id, order')
    .in('grade_id', ['primaria-4to', 'primaria-5to', 'primaria-6to'])
    .order('grade_id')
    .order('subject_id')
    .order('order');
    
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  console.log(`Found ${data.length} sequences.`);
  console.log(data);
  fs.writeFileSync('scratch/seq_headers.json', JSON.stringify(data, null, 2));
}

run();
