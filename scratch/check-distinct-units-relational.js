const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

async function run() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/units?select=subject_id,grade_levels`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Found ${data.length} entries in units.`);
      const combinations = {};
      for (const row of data) {
        const key = `${row.subject_id} | ${JSON.stringify(row.grade_levels)}`;
        combinations[key] = (combinations[key] || 0) + 1;
      }
      console.log("Combinations in units table:");
      console.log(JSON.stringify(combinations, null, 2));
    } else {
      console.log("Failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error(err);
  }
}

run();
