const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const realKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, realKey);

async function run() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }
  
  console.log(`Fetched ${profiles.length} profiles from Supabase.`);
  
  // Filter those with role = 'teacher' or 'admin' or subscription_tier = 'PRO' or other weird roles/tiers
  const weirdProfiles = profiles.filter(p => {
    const r = p.role;
    const t = p.subscription_tier;
    return r === 'teacher' || r === 'admin' || t === 'PRO' || t === 'Planix Pro' || r === 'ADMINISTRADOR_LECTURA';
  });
  
  console.log("Weird/target profiles found:", weirdProfiles.length);
  console.log(JSON.stringify(weirdProfiles.map(p => ({
    id: p.id,
    email: p.email,
    full_name: p.full_name,
    role: p.role,
    subscription_tier: p.subscription_tier
  })), null, 2));

  // Let's also print profiles that match our target emails
  const targetEmails = ["reyna.mancebo@docente.edu.do", "yeriorlandotic@gmail.com", "admin@planix.do", "hakunamatataprofebea@gmail.com"];
  const targetProfiles = profiles.filter(p => targetEmails.includes(p.email));
  console.log("Target email profiles in Supabase:", JSON.stringify(targetProfiles.map(p => ({
    id: p.id,
    email: p.email,
    full_name: p.full_name,
    role: p.role,
    subscription_tier: p.subscription_tier
  })), null, 2));
}

run();
