const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

async function countTable(tableName) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=count`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Prefer": "count=exact"
      }
    });
    if (res.ok) {
      console.log(`Table "${tableName}" has ${res.headers.get("content-range")} records.`);
    } else {
      console.log(`Failed "${tableName}":`, res.status, await res.text());
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await countTable("units");
  await countTable("unit_themes");
  await countTable("unit_subthemes");
}

run();
