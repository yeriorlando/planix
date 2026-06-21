const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    const resPlannings = await fetch(`${supabaseUrl}/rest/v1/plannings?select=subject_id&limit=50`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (resPlannings.ok) {
      const list = await resPlannings.json();
      const unique = [...new Set(list.map(g => g.subject_id))];
      console.log("Unique subject_ids in plannings:", unique);
    }

    const resRubrics = await fetch(`${supabaseUrl}/rest/v1/rubrics?select=subject_id&limit=50`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (resRubrics.ok) {
      const list = await resRubrics.json();
      const unique = [...new Set(list.map(g => g.subject_id))];
      console.log("Unique subject_ids in rubrics:", unique);
    }
  } catch (err) {
    console.error(err);
  }
}

run();
