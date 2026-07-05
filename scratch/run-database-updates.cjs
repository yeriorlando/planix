const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const path = require('path');

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const realKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, realKey);

// Cloudflare project path for wrangler D1 local execution
const cloudflareProjPath = "c:/Users/Yeri Orlando/Desktop/Planix Nuevo/Planix Claudflare/Planix";

async function runSupabaseUpdates() {
  console.log("=== RUNNING SUPABASE DATABASE UPDATES ===");

  // 1. Update Reyna Estevania Mancebo
  console.log("Updating Reyna Mancebo profile...");
  const { data: res1, error: err1 } = await supabase
    .from('profiles')
    .update({
      role: 'ADMINISTRADOR',
      subscription_tier: 'pro',
      subscription_status: 'active'
    })
    .eq('email', 'reyna.mancebo@docente.edu.do');
  
  if (err1) console.error("Error updating Reyna:", err1);
  else console.log("Reyna Mancebo updated successfully.");

  // 2. Update Yeri Orlando (admin@planix.do)
  console.log("Updating Yeri Orlando profile...");
  const { data: res2, error: err2 } = await supabase
    .from('profiles')
    .update({
      role: 'ADMINISTRADOR',
      subscription_tier: 'pro',
      subscription_status: 'active'
    })
    .eq('email', 'admin@planix.do');
  
  if (err2) console.error("Error updating Yeri:", err2);
  else console.log("Yeri Orlando updated successfully.");

  // 3. Upsert Orlando Perez (yeriorlandotic@gmail.com)
  console.log("Upserting Orlando Perez profile...");
  const orlandoId = '980bf4ef-220d-44a9-87d7-35b64137baed';
  const { data: res3, error: err3 } = await supabase
    .from('profiles')
    .upsert({
      id: orlandoId,
      email: 'yeriorlandotic@gmail.com',
      full_name: 'orlando perez',
      role: 'DOCENTE',
      subscription_tier: 'pro',
      subscription_status: 'active',
      is_active: true,
      school_name: 'HOGAR PITUCA FLORES',
      nivel_principal: 'PRIMARIA',
      year_escolar_activo: '2025-2026'
    });
  
  if (err3) console.error("Error upserting Orlando Perez:", err3);
  else console.log("Orlando Perez upserted successfully.");

  // 4. Update any other profiles in Supabase with role = 'teacher' to 'DOCENTE'
  console.log("Updating all other profiles with role = 'teacher' to 'DOCENTE'...");
  const { data: res4, error: err4 } = await supabase
    .from('profiles')
    .update({ role: 'DOCENTE' })
    .eq('role', 'teacher');
  
  if (err4) console.error("Error updating role 'teacher' to 'DOCENTE':", err4);
  else console.log("All other 'teacher' roles updated to 'DOCENTE' successfully.");

  // 5. Update any other profiles in Supabase with role = 'admin' to 'ADMINISTRADOR'
  console.log("Updating all other profiles with role = 'admin' to 'ADMINISTRADOR'...");
  const { data: res5, error: err5 } = await supabase
    .from('profiles')
    .update({ role: 'ADMINISTRADOR' })
    .eq('role', 'admin');
  
  if (err5) console.error("Error updating role 'admin' to 'ADMINISTRADOR':", err5);
  else console.log("All other 'admin' roles updated to 'ADMINISTRADOR' successfully.");
}

async function runLocalD1Updates() {
  console.log("\n=== RUNNING LOCAL D1 SQLITE UPDATES ===");
  
  // SQL commands to update the local SQLite database via wrangler
  const sqlCommands = [
    // Reyna
    "UPDATE profiles SET role = 'ADMINISTRADOR', subscription_tier = 'pro', subscription_status = 'active' WHERE email = 'reyna.mancebo@docente.edu.do';",
    // Yeri Orlando
    "UPDATE profiles SET role = 'ADMINISTRADOR', subscription_tier = 'pro', subscription_status = 'active' WHERE email = 'admin@planix.do';",
    // Orlando Perez
    "UPDATE profiles SET role = 'DOCENTE', subscription_tier = 'pro', subscription_status = 'active' WHERE email = 'yeriorlandotic@gmail.com';",
    // Profe Beatriz
    "UPDATE profiles SET role = 'DOCENTE', subscription_tier = 'free', subscription_status = 'active' WHERE email = 'beatrizmiguelinafelizvalentin@gmail.com';",
    // All other teachers/admins
    "UPDATE profiles SET role = 'DOCENTE' WHERE role = 'teacher';",
    "UPDATE profiles SET role = 'ADMINISTRADOR' WHERE role = 'admin';"
  ];

  for (const cmd of sqlCommands) {
    try {
      console.log(`Executing D1: ${cmd}`);
      const output = execSync(`npx wrangler d1 execute DB --local --command "${cmd}"`, {
        cwd: cloudflareProjPath,
        encoding: 'utf8'
      });
      console.log(output.trim());
    } catch (e) {
      console.error(`Error executing D1 command: ${cmd}`, e.message);
    }
  }
}

async function main() {
  await runSupabaseUpdates();
  await runLocalD1Updates();
  console.log("\n=== ALL DATABASE UPDATES COMPLETED ===");
}

main();
