const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const realKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, realKey);

async function run() {
  const { data: roles, error: err1 } = await supabase.from('profiles').select('role');
  if (err1) console.error(err1);
  else {
    const uniqueRoles = [...new Set(roles.map(r => r.role))];
    console.log("Unique Roles in Supabase:", uniqueRoles);
  }

  const { data: tiers, error: err2 } = await supabase.from('profiles').select('subscription_tier');
  if (err2) console.error(err2);
  else {
    const uniqueTiers = [...new Set(tiers.map(t => t.subscription_tier))];
    console.log("Unique Tiers in Supabase:", uniqueTiers);
  }
}

run();
