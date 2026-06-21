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
  console.log("Analyzing plannings counts in Supabase...");
  
  // 1. Get counts grouped by user_id
  const { data: plannings, error: err } = await supabase.from('plannings').select('user_id');
  if (err) {
    console.error("Error fetching plannings:", err);
    return;
  }
  
  const counts = {};
  plannings.forEach(p => {
    const uid = p.user_id;
    counts[uid] = (counts[uid] || 0) + 1;
  });
  
  console.log("Plannings count by user_id:", counts);
  
  // 2. Map user_ids to profiles
  const userIds = Object.keys(counts);
  if (userIds.length > 0) {
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);
      
    if (pErr) {
      console.error("Error fetching profiles:", pErr);
    } else {
      console.log("\nMatching profiles with planning counts:");
      profiles.forEach(prof => {
        console.log(`- Profile Name: ${prof.full_name}, Email: ${prof.email}, ID: ${prof.id} => Plannings count: ${counts[prof.id]}`);
      });
      
      const matchedIds = new Set(profiles.map(p => p.id));
      const unmatchedIds = userIds.filter(id => !matchedIds.has(id));
      if (unmatchedIds.length > 0) {
        console.log("\nUnmatched user_ids (plannings exist but no profile in db):", unmatchedIds);
      }
    }
  }
}

run();
