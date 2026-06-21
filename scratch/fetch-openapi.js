const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Accept": "application/openapi+json"
      }
    });
    if (res.ok) {
      const data = await res.json();
      const paths = Object.keys(data.paths || {});
      console.log("ALL DETECTED TABLES/PATHS:");
      console.log(JSON.stringify(paths, null, 2));
    } else {
      console.log("Failed to fetch OpenAPI spec (status " + res.status + "):", await res.text());
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
