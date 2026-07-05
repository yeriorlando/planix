const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const realKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, realKey);

async function run() {
  const emails = ["reyna.mancebo@docente.edu.do", "yeriorlandotic@gmail.com", "admin@planix.do", "hakunamatataprofebea@gmail.com"];
  const names = ["Reyna Estevania Mancebo", "orlando perez", "Yeri Orlando", "Beatriz"];

  console.log("--- SEARCH BY EMAILS ---");
  const { data: res1, error: err1 } = await supabase.from('profiles').select('*').in('email', emails);
  if (err1) console.error(err1);
  else console.log(JSON.stringify(res1, null, 2));

  console.log("--- SEARCH BY NAMES ---");
  for (const name of names) {
    const { data: res2, error: err2 } = await supabase.from('profiles').select('*').ilike('full_name', `%${name}%`);
    if (err2) console.error(err2);
    else console.log(`Name [${name}]:`, JSON.stringify(res2, null, 2));
  }
}

run();
