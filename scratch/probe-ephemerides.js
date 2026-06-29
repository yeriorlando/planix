const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function probeTable(tableName) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?limit=5`, {
      method: "GET",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Prefer": "count=exact"
      }
    });
    if (res.ok) {
      const data = await res.json();
      const count = res.headers.get("content-range") || "unknown";
      console.log(`Table "${tableName}" EXISTS. Rows: ${JSON.stringify(data)}, range: ${count}`);
    } else {
      console.log(`Table "${tableName}" status: ${res.status} (${res.statusText})`);
      const text = await res.text();
      console.log("Error details:", text);
    }
  } catch (err) {
    console.error(`Error probing "${tableName}":`, err.message);
  }
}

async function run() {
  const candidateTables = [
    "ephemerides",
    "efemerides",
    "monthly_values",
    "valores_mes"
  ];
  for (const t of candidateTables) {
    await probeTable(t);
  }
}

run();
