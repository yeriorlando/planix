const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    console.log("Deleting incorrect lowercase grades...");
    const res = await fetch(`${supabaseUrl}/rest/v1/official_grades?subject_id=eq.lengua-espanola`, {
      method: "DELETE",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    
    if (res.ok) {
      console.log("Cleanup successful!");
    } else {
      console.log("Failed to clean up:", res.status, await res.text());
    }
  } catch (err) {
    console.error(err);
  }
}

run();
