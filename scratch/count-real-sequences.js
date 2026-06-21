const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

async function run() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/sequences?select=count`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Prefer": "count=exact"
      }
    });
    if (res.ok) {
      const count = res.headers.get("content-range") || "unknown";
      console.log(`Table "sequences" has ${count} records.`);
    } else {
      console.log("Failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error(err);
  }
}

run();
