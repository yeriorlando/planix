const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

async function run() {
  const emails = ["reyna.mancebo@docente.edu.do", "yeriorlandotic@gmail.com", "admin@planix.do"];
  for (const email of emails) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, {
        headers: {
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`Profile for ${email} in Supabase:`, JSON.stringify(data, null, 2));
      } else {
        console.log(`Failed for ${email}:`, res.status, await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  }
}

run();
