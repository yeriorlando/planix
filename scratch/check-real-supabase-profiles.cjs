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
  const emails = [
    'reyna.mancebo@docente.edu.do',
    'yeriorlandotic@gmail.com',
    'admin@planix.do',
    'beatrizmiguelinafelizvalentin@gmail.com'
  ];
  
  console.log("Checking profiles in active Supabase:", supabaseUrl);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, subscription_tier, subscription_status')
    .in('email', emails);

  if (error) {
    console.error("Error querying profiles:", error);
  } else {
    console.log("Found profiles:", JSON.stringify(data, null, 2));
  }
}

run();
