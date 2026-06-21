const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";
const teacherId = "03526346-2103-4fa3-b832-17f134dc482b";

async function checkData() {
  try {
    // 1. Get profile
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${teacherId}`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    const profile = await profileRes.json();
    console.log("=== Profile ===");
    console.log(JSON.stringify(profile, null, 2));

    // 2. Get classrooms
    const classroomsRes = await fetch(`${supabaseUrl}/rest/v1/classrooms?teacher_id=eq.${teacherId}`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    const classrooms = await classroomsRes.json();
    console.log("=== Classrooms ===");
    console.log(JSON.stringify(classrooms, null, 2));

    // 3. Get students for those classrooms
    if (classrooms.length > 0) {
      const classIds = classrooms.map(c => c.id).join(",");
      const studentsRes = await fetch(`${supabaseUrl}/rest/v1/students?classroom_id=in.(${classIds})`, {
        headers: {
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`
        }
      });
      const students = await studentsRes.json();
      console.log("=== Students ===");
      console.log(JSON.stringify(students, null, 2));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkData();
