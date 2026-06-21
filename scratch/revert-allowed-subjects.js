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
    console.log(`Found ${profiles.length} profiles. Reverting allowed_subjects for non-admin profiles...`);

    let updatedCount = 0;

    const exemptEmails = ["admin@planix.do", "yeriorlandotic@gmail.com"];

    for (const p of profiles) {
      if (!p.allowed_subjects) continue;
      if (exemptEmails.includes(p.email?.toLowerCase())) {
        console.log(`Skipping exempt profile: ${p.email}`);
        continue;
      }

      let changed = false;
      const updatedAllowed = { ...p.allowed_subjects };

      for (const gradeId in updatedAllowed) {
        if (Array.isArray(updatedAllowed[gradeId])) {
          const subjects = updatedAllowed[gradeId];
          const index = subjects.indexOf("ingles");
          if (index !== -1) {
            subjects.splice(index, 1);
            changed = true;
          }
        }
      }

      if (changed) {
        console.log(`Reverting allowed_subjects for ${p.email} (${p.id})...`);
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
          console.log(`Successfully reverted ${p.email}`);
          updatedCount++;
        } else {
          console.error(`Failed to update ${p.email}:`, updateRes.status, await updateRes.text());
        }
      }
    }

    console.log(`Finished. Reverted ${updatedCount} profiles.`);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
