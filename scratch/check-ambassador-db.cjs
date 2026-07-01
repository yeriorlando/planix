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
  console.log("Fetching profiles where is_ambassador = true...");
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_ambassador, preferences')
    .or('is_ambassador.eq.true,is_ambassador.eq.1');

  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  console.log(`Found ${profiles.length} ambassador profiles:`);
  console.log(JSON.stringify(profiles, null, 2));
}

run();
