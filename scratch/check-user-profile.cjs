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
  console.log("Checking user profile details...");
  
  const emails = ["yeriorlandotic@gmail.com", "yeriorlando@gmail.com", "admin@planix.do", "yeriorlandoxx@gmail.com"];
  
  for (const email of emails) {
    const { data: rows, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email);
      
    if (error) {
      console.error(`Error fetching profile for ${email}:`, error);
    } else {
      console.log(`\n=== Profile for ${email} ===`);
      console.log(JSON.stringify(rows[0], null, 2));
    }
  }
}

run();
