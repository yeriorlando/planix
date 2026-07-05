const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const realKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

async function run() {
  const names = ["Reyna Estevania Mancebo", "orlando perez", "Yeri Orlando"];
  for (const name of names) {
    const url = `${supabaseUrl}/rest/v1/profiles?full_name=ilike.%${encodeURIComponent(name)}%`;
    try {
      const res = await fetch(url, {
        headers: { "apikey": realKey, "Authorization": `Bearer ${realKey}` }
      });
      console.log(`Fetch for Name [${name}] - Status: ${res.status}`);
      const text = await res.text();
      console.log(`Response length: ${text.length}`);
      console.log(`Content: ${text.substring(0, 200)}`);
    } catch (e) {
      console.error(`Error fetching name ${name}:`, e);
    }
  }
}

run();
