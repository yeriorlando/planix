const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function queryAll() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/ephemerides`, {
      method: "GET",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      const counts = {};
      for (const item of data) {
        counts[item.month] = (counts[item.month] || 0) + 1;
      }
      console.log("Ephemerides per month in Supabase:", counts);
    } else {
      console.log(`Error: ${res.status}`);
    }
  } catch (err) {
    console.error(err);
  }
}

queryAll();
