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
  console.log("Fetching RLS policies for profiles table...");
  const { data, error } = await supabase.rpc('get_policies_for_table', { table_name: 'profiles' });
  
  if (error) {
    // If RPC doesn't exist, run a direct query using postgres catalog
    console.log("RPC get_policies_for_table failed or doesn't exist. Querying pg_policies...");
    const { data: policies, error: queryErr } = await supabase
      .from('profiles')
      .select('tablename')
      .limit(1); // just a check
      
    // Let's run a generic query on pg_policies using an upsert/select trick or sql if possible
    // Wait, supabase-js doesn't allow raw SQL queries directly unless we have an RPC.
    // Let's check if we can query pg_policies using a view or if we can see what's allowed.
  }
  
  // Let's try to query pg_policies using RPC if there's any sql function, or let's query all policies
  const { data: policies, error: polErr } = await supabase
    .rpc('exec_sql', { sql_query: "SELECT * FROM pg_policies WHERE tablename = 'profiles'" });
  
  if (polErr) {
    console.error("exec_sql RPC failed:", polErr);
    // Let's try another common RPC name or check standard policies
  } else {
    console.log("Policies:", policies);
  }
}

run();
