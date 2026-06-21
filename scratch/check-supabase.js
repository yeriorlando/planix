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
  console.log("Checking Supabase connection...");
  
  // Test profiles
  const { data: profiles, error: profileErr } = await supabase.from('profiles').select('id, full_name, email').limit(5);
  if (profileErr) {
    console.error("Error fetching profiles:", profileErr);
  } else {
    console.log("Profiles found:", profiles);
  }

  // Test plannings
  const { data: plannings, error: planErr } = await supabase.from('plannings').select('id, user_id, title, created_at').limit(10);
  if (planErr) {
    console.error("Error fetching plannings:", planErr);
  } else {
    console.log(`Plannings found (${plannings.length}):`, plannings);
  }
}

run();
