const { execSync } = require('child_process');

const cloudflareProjPath = "c:/Users/Yeri Orlando/Desktop/Planix Nuevo/Planix Claudflare/Planix";

async function run() {
  console.log("=== RUNNING REMOTE D1 DATABASE UPDATES ===");
  
  const sqlCommands = [
    // Reyna Mancebo
    "UPDATE profiles SET role = 'ADMINISTRADOR', subscription_tier = 'pro', subscription_status = 'active' WHERE email = 'reyna.mancebo@docente.edu.do';",
    // Orlando Perez
    "UPDATE profiles SET role = 'DOCENTE', subscription_tier = 'pro', subscription_status = 'active' WHERE email = 'yeriorlandotic@gmail.com';",
    // Yeri Orlando
    "UPDATE profiles SET role = 'ADMINISTRADOR', subscription_tier = 'pro', subscription_status = 'active' WHERE email = 'admin@planix.do';",
    // Profe Beatriz
    "UPDATE profiles SET role = 'DOCENTE', subscription_tier = 'free', subscription_status = 'active' WHERE email = 'beatrizmiguelinafelizvalentin@gmail.com';",
    // All other teachers/admins
    "UPDATE profiles SET role = 'DOCENTE' WHERE role = 'teacher';",
    "UPDATE profiles SET role = 'ADMINISTRADOR' WHERE role = 'admin';"
  ];

  for (const cmd of sqlCommands) {
    try {
      console.log(`Executing Remote D1: ${cmd}`);
      const output = execSync(`npx wrangler d1 execute planix-db --remote --command "${cmd}"`, {
        cwd: cloudflareProjPath,
        encoding: 'utf8'
      });
      console.log(output.trim());
    } catch (e) {
      console.error(`Error executing remote D1 command: ${cmd}`, e.message);
    }
  }
  
  console.log("=== REMOTE D1 DATABASE UPDATES COMPLETED ===");
}

run();
