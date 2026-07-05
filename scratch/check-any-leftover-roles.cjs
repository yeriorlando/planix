const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const realKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, realKey);

async function run() {
  const { data: profiles, error } = await supabase.from('profiles').select('role, subscription_tier');
  if (error) {
    console.error(error);
    return;
  }
  const uniqueRoles = [...new Set(profiles.map(r => r.role))];
  const uniqueTiers = [...new Set(profiles.map(t => t.subscription_tier))];
  console.log("Updated Unique Roles in Supabase:", uniqueRoles);
  console.log("Updated Unique Tiers in Supabase:", uniqueTiers);
}

run();
