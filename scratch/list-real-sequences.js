const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

async function run() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/sequences?select=*&limit=1`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Found ${data.length} sequences in remote Supabase.`);
      if (data.length > 0) {
        console.log("Columns of sequences table:", Object.keys(data[0]));
        console.log("Sample sequences metadata:", JSON.stringify(data[0], null, 2).substring(0, 500));
      }
    } else {
      console.log("Failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error(err);
  }
}

run();
