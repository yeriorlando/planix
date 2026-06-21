const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function testUpsert() {
  const testId = "test-seq-id-999";
  const payload = {
    id: testId,
    subject_id: "lengua-espanola",
    grade_id: "primaria-1ro",
    content: {
      testField: "hello world",
      timestamp: Date.now()
    },
    updated_at: new Date().toISOString()
  };

  try {
    console.log("Testing upsert with raw JSON object...");
    const res = await fetch(`${supabaseUrl}/rest/v1/custom_sequences`, {
      method: "POST",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log("Upsert succeeded with raw JSON object!");
    } else {
      console.log("Upsert failed (raw JSON):", res.status, await res.text());
    }

    // Clean up
    await fetch(`${supabaseUrl}/rest/v1/custom_sequences?id=eq.${testId}`, {
      method: "DELETE",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });

  } catch (err) {
    console.error("Upsert test error:", err.message);
  }
}

testUpsert();
