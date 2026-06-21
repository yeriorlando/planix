const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function testInsert() {
  const payload = {
    key: "referral_settings",
    value: { referrer_credits: 50, referred_credits: 30 },
    updated_at: new Date().toISOString()
  };

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/site_configs`, {
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
      console.log("Insert/upsert succeeded!");
    } else {
      console.log("Failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error(err);
  }
}

testInsert();
