const supabaseUrl = "https://api.planix.do";
const anonKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I"; // Note: this is actually the service role key from .env.local! Wait, is it?

async function testRead(tableName) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?limit=5`, {
      method: "GET",
      headers: {
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Table "${tableName}" read successful using key. Found ${data.length} rows.`);
    } else {
      console.log(`Table "${tableName}" read failed: ${res.status} (${res.statusText})`);
      console.log(await res.text());
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await testRead("ephemerides");
  await testRead("monthly_values");
}

run();
