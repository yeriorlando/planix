const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

async function checkThemes() {
  const ids = ["30cf92cc-728b-4f43-b488-03f7e162126c", "c4ac44ab-4902-4845-bc90-5a27ab0b60af"];
  for (const id of ids) {
    const res = await fetch(`${supabaseUrl}/rest/v1/unit_themes?select=id,title,unit_id&unit_id=eq.${id}`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (res.ok) {
      const themes = await res.json();
      console.log(`Themes for unit ${id}:`);
      for (const t of themes) {
        // fetch subthemes
        const subRes = await fetch(`${supabaseUrl}/rest/v1/unit_subthemes?select=title&theme_id=eq.${t.id}&limit=3`, {
          headers: {
            "apikey": serviceRoleKey,
            "Authorization": `Bearer ${serviceRoleKey}`
          }
        });
        const subs = await subRes.json();
        console.log(` - Theme: ${t.title}`);
        console.log(`   Subthemes (sample):`, subs.map(s => s.title));
      }
    } else {
      console.log("Failed for", id);
    }
  }
}

checkThemes();
