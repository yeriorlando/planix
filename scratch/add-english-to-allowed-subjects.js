const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
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
    
    const profiles = await res.json();
    console.log(`Found ${profiles.length} profiles. Checking allowed_subjects...`);

    let updatedCount = 0;

    for (const p of profiles) {
      if (!p.allowed_subjects) continue;

      let changed = false;
      const updatedAllowed = { ...p.allowed_subjects };

      const targetGrades = ["primaria-4to", "primaria-5to", "primaria-6to"];
      for (const g of targetGrades) {
        if (updatedAllowed[g]) {
          const subjects = updatedAllowed[g];
          if (!subjects.includes("ingles")) {
            subjects.push("ingles");
            changed = true;
          }
        }
      }

      if (changed) {
        console.log(`Updating profile for ${p.email} (${p.id})...`);
        const updateRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${p.id}`, {
          method: "PATCH",
          headers: {
            "apikey": serviceRoleKey,
            "Authorization": `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({
            allowed_subjects: updatedAllowed
          })
        });

        if (updateRes.ok) {
          console.log(`Successfully updated ${p.email}`);
          updatedCount++;
        } else {
          console.error(`Failed to update ${p.email}:`, updateRes.status, await updateRes.text());
        }
      }
    }

    console.log(`Finished. Updated ${updatedCount} profiles.`);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
