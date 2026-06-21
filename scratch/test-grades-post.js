const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    const payload = [{
      student_id: "a8d4455e-47bb-4a47-953e-85dcd45acc96",
      classroom_id: "785faa2c-9e11-4dec-ac15-7c7d8cb8b8e7",
      subject_id: "lengua-espanola",
      competency_id: "C1",
      p1: 67,
      rp1: null,
      p2: 67,
      rp2: null,
      p3: 67,
      rp3: null,
      p4: 67,
      rp4: null,
      competency_average: 67,
      academic_year: "2025-2026",
      updated_at: new Date().toISOString()
    }];

    const res = await fetch(`${supabaseUrl}/rest/v1/official_grades`, {
      method: "POST",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify(payload)
    });

    console.log("Status:", res.status);
    console.log("Response text:", await res.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
