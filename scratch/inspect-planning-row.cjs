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
  console.log("Fetching a few rows from the plannings table in Supabase...");
  
  const { data: plannings, error } = await supabase
    .from('plannings')
    .select('*')
    .limit(3);
    
  if (error) {
    console.error("Error fetching plannings:", error);
    return;
  }
  
  console.log("Plannings structure:");
  plannings.forEach((p, idx) => {
    console.log(`\n--- Planning #${idx + 1} ---`);
    console.log(JSON.stringify(p, null, 2));
    
    // Check if content is string or object
    console.log("content type:", typeof p.content);
    if (typeof p.content === 'string') {
      try {
        const parsed = JSON.parse(p.content);
        console.log("Parsed content keys:", Object.keys(parsed));
        if (parsed.formData) {
          console.log("formData keys:", Object.keys(parsed.formData));
        }
      } catch (e) {
        console.log("Failed to parse content as JSON:", e.message);
      }
    } else if (p.content) {
      console.log("content keys:", Object.keys(p.content));
      if (p.content.formData) {
        console.log("formData keys:", Object.keys(p.content.formData));
      }
    }
  });
}

run();
