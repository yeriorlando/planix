const supabaseUrl = "https://api.planix.do";
const serviceRoleKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

async function run() {
  try {
    const resAll = await fetch(`${supabaseUrl}/rest/v1/profiles?full_name=ilike.*orlando*`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (resAll.ok) {
      const data = await resAll.json();
      console.log("Matching profiles for 'orlando':", JSON.stringify(data.map(u => ({ id: u.id, email: u.email, name: u.full_name, role: u.role })), null, 2));
    } else {
      console.log("Failed:", resAll.status, await resAll.text());
    }

    const resYeri = await fetch(`${supabaseUrl}/rest/v1/profiles?full_name=ilike.*yeri*`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (resYeri.ok) {
      const data = await resYeri.json();
      console.log("Matching profiles for 'yeri':", JSON.stringify(data.map(u => ({ id: u.id, email: u.email, name: u.full_name, role: u.role })), null, 2));
    } else {
      console.log("Failed:", resYeri.status, await resYeri.text());
    }

  } catch (err) {
    console.error(err);
  }
}

run();
