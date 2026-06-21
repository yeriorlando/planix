const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  console.log("Checking profiles in Supabase 2...");
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, email, full_name').limit(10);
  if (pErr) {
    console.error("Error fetching profiles:", pErr);
  } else {
    console.log("Profiles in Supabase 2:", profiles);
  }

  console.log("\nChecking plannings in Supabase 2...");
  const { data: plannings, error: plErr } = await supabase.from('plannings').select('id, user_id, title').limit(10);
  if (plErr) {
    console.error("Error fetching plannings:", plErr);
  } else {
    console.log("Plannings in Supabase 2:", plannings);
  }
}

run();
