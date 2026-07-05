const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const realKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, realKey);

async function run() {
  const emails = [
    "reyna.mancebo@docente.edu.do",
    "yeriorlandotic@gmail.com",
    "admin@planix.do",
    "hakunamatataprofebea@gmail.com"
  ];
  
  let resultText = "";

  for (const email of emails) {
    const { data, error } = await supabase.from('profiles').select('*').eq('email', email);
    if (error) {
      resultText += `Error fetching ${email}: ${JSON.stringify(error)}\n\n`;
    } else {
      resultText += `=== EMAIL: ${email} ===\n`;
      if (data && data.length > 0) {
        resultText += JSON.stringify(data[0], null, 2) + "\n\n";
      } else {
        resultText += "NOT FOUND\n\n";
      }
    }
  }

  // Let's also search for any user with name containing "orlando" or "reyna" or "beatriz" to see if there are other emails
  const searchNames = ["Reyna", "orlando perez", "Beatriz"];
  for (const name of searchNames) {
    const { data, error } = await supabase.from('profiles').select('id, email, full_name, role, subscription_tier, subscription_status').ilike('full_name', `%${name}%`);
    if (error) {
      resultText += `Error searching name ${name}: ${JSON.stringify(error)}\n\n`;
    } else {
      resultText += `=== NAME SEARCH: ${name} ===\n`;
      resultText += JSON.stringify(data, null, 2) + "\n\n";
    }
  }

  fs.writeFileSync(path.join(__dirname, 'target-users-details.txt'), resultText);
  console.log("Written details to scratch/target-users-details.txt");
}

run();
