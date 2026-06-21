const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

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
      console.log(`Table "${tableName}" DOES NOT EXIST in Real Supabase. Status:`, res.status, await res.text());
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
