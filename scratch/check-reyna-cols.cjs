const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://api.planix.do/";
const supabaseServiceKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  const { data: rows, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, school_name, regional, distrito, municipio, nivel_principal, ciclo_principal, grado_principal')
    .eq('email', 'reyna.mancebo@docente.edu.do');
    
  if (error) {
    console.error("Error fetching profile:", error);
  } else {
    console.log("=== Profile fields in Supabase ===");
    console.log(rows[0]);
  }
}

run();
