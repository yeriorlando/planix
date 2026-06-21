const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

async function checkTable(tableName) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?limit=1`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Table "${tableName}" EXISTS in Real Supabase. Sample:`, data);
    } else {
      console.log(`Table "${tableName}" status in Real Supabase:`, res.status, await res.text());
    }
  } catch (err) {
    console.error(`Error checking "${tableName}":`, err.message);
  }
}

async function run() {
  await checkTable("custom_units");
  await checkTable("custom_sequences");
  await checkTable("profiles");
}

run();
