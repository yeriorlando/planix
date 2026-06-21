const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/official_grades?select=subject_id`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    
    if (!res.ok) {
      console.log("Error status:", res.status);
      console.log(await res.text());
      return;
    }
    
    const list = await res.json();
    const unique = [...new Set(list.map(g => g.subject_id))];
    console.log("Unique subject_ids in official_grades:", unique);
  } catch (err) {
    console.error(err);
  }
}

run();
