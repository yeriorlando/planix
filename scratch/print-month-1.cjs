const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { data, error } = await supabase
    .from("ephemerides")
    .select("*")
    .eq("month", 1)
    .order("day", { ascending: true });
    
  if (error) {
    console.error(error);
  } else {
    console.log(`Found ${data.length} ephemerides for January:`);
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
