const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function testUpsert() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/monthly_values`, {
      method: "POST",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify({
        month: 6,
        value_name: "Test Value para Junio",
        updated_at: new Date().toISOString()
      })
    });
    if (res.ok) {
      console.log("Upsert monthly_values successful!");
    } else {
      console.log(`Upsert monthly_values failed: ${res.status} (${res.statusText})`);
      console.log(await res.text());
    }
  } catch (err) {
    console.error(err);
  }
}

testUpsert();
