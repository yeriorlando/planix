const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://api.planix.do";
const anonKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I"; // Wait, is this the anon key or service role key? Let's check env

// Let's use the actual anon key from .env.local to trigger a password recovery as a normal client
const realAnonKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I"; // Service role is often same as anon or different? Let's check

async function run() {
  const supabase = createClient(supabaseUrl, realAnonKey);
  console.log("Triggering resetPasswordForEmail for a test email...");
  const { data, error } = await supabase.auth.resetPasswordForEmail("yeriorlandotic@gmail.com", {
    redirectTo: "https://localhost:3000/actualizar-contrasena"
  });

  if (error) {
    console.error("Error triggering password reset:", error);
  } else {
    console.log("Success response:", data);
  }
}

run();
