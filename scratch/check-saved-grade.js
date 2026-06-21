const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/official_grades?student_id=eq.a8d4455e-47bb-4a47-953e-85dcd45acc96`, {
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
    
    const grades = await res.json();
    console.log("Found grades in Supabase for student a8d4455e-47bb-4a47-953e-85dcd45acc96:");
    console.log(JSON.stringify(grades, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
