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
  console.log("Fetching ephemerides from Supabase...");
  const { data, error } = await supabase
    .from('ephemerides')
    .select('*');

  if (error) {
    console.error("Error fetching ephemerides from Supabase:", error);
    return;
  }

  console.log(`Fetched ${data ? data.length : 0} ephemerides.`);
  if (data && data.length > 0) {
    console.log("Sample ephemerides:");
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
  }
}

run();
