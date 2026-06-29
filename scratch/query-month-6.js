const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function queryMonth(month) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/ephemerides?month=eq.${month}&order=day.asc`, {
      method: "GET",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Month ${month}: Found ${data.length} ephemerides.`);
      console.log(JSON.stringify(data.slice(0, 3), null, 2));
    } else {
      console.log(`Error querying month ${month}: ${res.status}`);
    }
  } catch (err) {
    console.error(err);
  }
}

queryMonth(6);
