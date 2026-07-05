const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const realKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, realKey);

async function run() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error listing auth users:", error);
  } else {
    console.log("Total auth users in Supabase:", data.users.length);
    const emails = ["reyna.mancebo@docente.edu.do", "yeriorlandotic@gmail.com", "admin@planix.do", "hakunamatataprofebea@gmail.com"];
    for (const email of emails) {
      const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      console.log(`Auth user for [${email}]:`, user ? { id: user.id, email: user.email } : "NOT FOUND");
    }
    
    // Check if there are other emails matching orlando
    const orlandoUsers = data.users.filter(u => u.email.toLowerCase().includes("orlando"));
    console.log("Orlando auth users:", orlandoUsers.map(u => ({ id: u.id, email: u.email })));
  }
}

run();
