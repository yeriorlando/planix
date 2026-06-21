const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    const teacherId = "99fdd656-b495-47ff-b677-8c77a8b59a3c";
    const res = await fetch(`${supabaseUrl}/rest/v1/classrooms?teacher_id=eq.${teacherId}`, {
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
    console.log(`Found ${list.length} classrooms for teacher ${teacherId}:`);
    list.forEach(c => {
      console.log(`ID: ${c.id}, Name: ${c.name}, Grade: ${c.grade}, Section: ${c.section}, Year: ${c.academic_year}`);
    });
  } catch (err) {
    console.error(err);
  }
}

run();
