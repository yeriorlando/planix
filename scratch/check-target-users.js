const fs = require('fs');
const path = require('path');

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const realKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

async function run() {
  const emails = ["reyna.mancebo@docente.edu.do", "yeriorlandotic@gmail.com", "admin@planix.do"];
  const names = ["Reyna Estevania Mancebo", "orlando perez", "Yeri Orlando"];
  
  let output = "";

  // Fetch by emails
  for (const email of emails) {
    const url = `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`;
    const res = await fetch(url, {
      headers: { "apikey": realKey, "Authorization": `Bearer ${realKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      output += `=== Email [${email}] ===\n` + JSON.stringify(data, null, 2) + "\n\n";
    }
  }

  // Fetch by names
  for (const name of names) {
    const url = `${supabaseUrl}/rest/v1/profiles?full_name=ilike.%${encodeURIComponent(name)}%`;
    const res = await fetch(url, {
      headers: { "apikey": realKey, "Authorization": `Bearer ${realKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      output += `=== Name [${name}] ===\n` + JSON.stringify(data, null, 2) + "\n\n";
    }
  }

  // Let's also check if there is any other user whose email contains "orlando"
  const url = `${supabaseUrl}/rest/v1/profiles?email=ilike.*orlando*`;
  const res = await fetch(url, {
    headers: { "apikey": realKey, "Authorization": `Bearer ${realKey}` }
  });
  if (res.ok) {
    const data = await res.json();
    output += `=== Users containing "orlando" in email ===\n` + JSON.stringify(data, null, 2) + "\n\n";
  }

  fs.writeFileSync(path.join(__dirname, 'output.txt'), output, 'utf-8');
  console.log("Done. Output written to scratch/output.txt");
}

run();
