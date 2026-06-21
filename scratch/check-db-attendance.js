const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    const classId = "785faa2c-9e11-4dec-ac15-7c7d8cb8b8e7";
    const res = await fetch(`${supabaseUrl}/rest/v1/attendance?classroom_id=eq.${classId}`, {
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
    console.log(`Found ${list.length} attendance records in Supabase for classroom ${classId}:`);
    list.forEach(r => {
      console.log(`ID: ${r.id}, Date: ${r.fecha}, Type: ${r.tipo_dia}`);
    });
  } catch (err) {
    console.error(err);
  }
}

run();
