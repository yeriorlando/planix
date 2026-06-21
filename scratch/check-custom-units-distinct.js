const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/custom_units?select=subject_id,grade_id`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Found ${data.length} entries in custom_units.`);
      const combinations = {};
      for (const row of data) {
        const key = `${row.subject_id} | ${row.grade_id}`;
        combinations[key] = (combinations[key] || 0) + 1;
      }
      console.log("Combinations in custom_units table:");
      console.log(JSON.stringify(combinations, null, 2));
    } else {
      console.log("Failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error(err);
  }
}

run();
