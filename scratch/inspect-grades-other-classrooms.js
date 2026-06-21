const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/official_grades?p1=eq.78&p2=eq.87`, {
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
    console.log(`Found ${list.length} records matching P1=78 and P2=87 in Supabase:`);
    list.forEach(g => {
      console.log(`ID: ${g.id}, Classroom: ${g.classroom_id}, Student: ${g.student_id}, Subject: ${g.subject_id}, Competency: ${g.competency_id}, Year: ${g.academic_year}`);
    });
  } catch (err) {
    console.error(err);
  }
}

run();
