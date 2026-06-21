const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://api.planix.do/";
const supabaseAnonKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  console.log("Checking Supabase query with Anon Key...");
  
  // Try querying plannings without logging in
  const { data: plansAnon, error: errAnon } = await supabase.from('plannings').select('id, user_id, title').limit(5);
  if (errAnon) {
    console.error("Error querying plannings with Anon Key:", errAnon);
  } else {
    console.log(`Query without login returned ${plansAnon.length} plans:`, plansAnon);
  }
}

run();
