const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    const classId = "785faa2c-9e11-4dec-ac15-7c7d8cb8b8e7";
    
    // 1. Delete all grades for this classroom in Supabase
    console.log("Deleting official_grades in Supabase...");
    const gradesRes = await fetch(`${supabaseUrl}/rest/v1/official_grades?classroom_id=eq.${classId}`, {
      method: "DELETE",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    console.log("Grades delete status:", gradesRes.status);
    
    // 2. Delete all subject summaries for this classroom in Supabase
    console.log("Deleting subject_summaries in Supabase...");
    const summariesRes = await fetch(`${supabaseUrl}/rest/v1/subject_summaries?classroom_id=eq.${classId}`, {
      method: "DELETE",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    console.log("Summaries delete status:", summariesRes.status);

    // 3. Delete all attendance for this classroom in Supabase
    console.log("Deleting attendance in Supabase...");
    const attRes = await fetch(`${supabaseUrl}/rest/v1/attendance?classroom_id=eq.${classId}`, {
      method: "DELETE",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    console.log("Attendance delete status:", attRes.status);

    console.log("Supabase cleanup completed successfully!");
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}

run();
