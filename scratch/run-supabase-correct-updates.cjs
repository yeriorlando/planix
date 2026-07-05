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
  console.log("=== RUNNING SUPABASE PRODUCTION DATABASE UPDATES ===");

  // 1. Update Reyna Estevania Mancebo
  console.log("Updating Reyna Mancebo...");
  const { data: res1, error: err1 } = await supabase
    .from('profiles')
    .update({ 
      role: 'ADMINISTRADOR', 
      subscription_tier: 'pro', 
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('email', 'reyna.mancebo@docente.edu.do');
  
  if (err1) {
    console.error("Error updating Reyna:", err1);
  } else {
    console.log("Reyna updated successfully.");
  }

  // 2. Update Orlando Perez
  console.log("Updating Orlando Perez...");
  const { data: res2, error: err2 } = await supabase
    .from('profiles')
    .update({ 
      role: 'DOCENTE', 
      subscription_tier: 'pro', 
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('email', 'yeriorlandotic@gmail.com');

  if (err2) {
    console.error("Error updating Orlando Perez:", err2);
  } else {
    console.log("Orlando Perez updated successfully.");
  }

  // 3. Update Yeri Orlando (admin@planix.do)
  console.log("Updating Yeri Orlando...");
  const { data: res3, error: err3 } = await supabase
    .from('profiles')
    .update({ 
      role: 'ADMINISTRADOR', 
      subscription_tier: 'pro', 
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('email', 'admin@planix.do');

  if (err3) {
    console.error("Error updating Yeri Orlando:", err3);
  } else {
    console.log("Yeri Orlando updated successfully.");
  }

  // 4. Update Beatriz
  console.log("Updating Beatriz...");
  const { data: res4, error: err4 } = await supabase
    .from('profiles')
    .update({ 
      role: 'DOCENTE', 
      subscription_tier: 'free', 
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('email', 'beatrizmiguelinafelizvalentin@gmail.com');

  if (err4) {
    console.error("Error updating Beatriz:", err4);
  } else {
    console.log("Beatriz updated successfully.");
  }

  // 5. Update any remaining role 'teacher' -> 'DOCENTE'
  console.log("Normalizing role 'teacher' -> 'DOCENTE'...");
  const { data: res5, error: err5 } = await supabase
    .from('profiles')
    .update({ 
      role: 'DOCENTE',
      updated_at: new Date().toISOString()
    })
    .eq('role', 'teacher');

  if (err5) {
    console.error("Error normalizing 'teacher' roles:", err5);
  } else {
    console.log("Normalized 'teacher' roles successfully.");
  }

  // 6. Update any remaining role 'admin' -> 'ADMINISTRADOR'
  console.log("Normalizing role 'admin' -> 'ADMINISTRADOR'...");
  const { data: res6, error: err6 } = await supabase
    .from('profiles')
    .update({ 
      role: 'ADMINISTRADOR',
      updated_at: new Date().toISOString()
    })
    .eq('role', 'admin');

  if (err6) {
    console.error("Error normalizing 'admin' roles:", err6);
  } else {
    console.log("Normalized 'admin' roles successfully.");
  }

  // 7. Verify all updated records
  const emails = [
    'reyna.mancebo@docente.edu.do',
    'yeriorlandotic@gmail.com',
    'admin@planix.do',
    'beatrizmiguelinafelizvalentin@gmail.com'
  ];
  const { data: profiles, error: errVerify } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, subscription_tier, subscription_status')
    .in('email', emails);

  if (errVerify) {
    console.error("Error verifying final profiles:", errVerify);
  } else {
    console.log("\nVerified Profiles in Supabase:");
    console.log(JSON.stringify(profiles, null, 2));
  }

  console.log("=== SUPABASE DATABASE UPDATES COMPLETED ===");
}

run();
