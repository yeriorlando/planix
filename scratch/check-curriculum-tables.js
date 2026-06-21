const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function checkTable(tableName) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?limit=2`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Sample row for "${tableName}":`, JSON.stringify(data, null, 2));
    } else {
      console.log(`Failed "${tableName}":`, res.status, await res.text());
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await checkTable("unit_themes");
  await checkTable("unit_subthemes");
}

run();
