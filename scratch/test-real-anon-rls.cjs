const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://api.planix.do/";
// The actual anon key from Planix Cloudflare .env.local
const realAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTgyMTAsImV4cCI6MjA4NDU3NDIxMH0.LVBBFMJFlbTcsfX8vFZroV6BvssAQtZS_pFAQqzTasI";

const supabase = createClient(supabaseUrl, realAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  console.log("Checking Supabase query with the actual Anon Key...");
  
  // Try querying plannings without logging in
  const { data, error } = await supabase.from('plannings').select('id, user_id, title').limit(5);
  if (error) {
    console.error("Error querying plannings with actual Anon Key:", error);
  } else {
    console.log(`Query returned ${data.length} plans:`, data);
  }
}

run();
