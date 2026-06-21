const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file to get keys
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  if (match) {
    let val = match[1].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    return val;
  }
  return null;
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || getEnvVar('VITE_SUPABASE_URL');
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration in .env.local");
  process.exit(1);
}

console.log("Supabase URL:", supabaseUrl);
// Initialize Supabase with service role key to bypass RLS and perform system inspections
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  try {
    console.log("\n--- Checking database triggers on auth.users ---");
    // We can run arbitrary SQL queries via RPC if there's a custom SQL executor function,
    // or by querying Postgres system tables via REST API if the API is exposed,
    // or we can query the public.profiles table or check the API schema.
    
    // First, let's query the profiles table to see some recent rows and their role values.
    const { data: profiles, error: errProfiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (errProfiles) {
      console.error("Error fetching profiles:", errProfiles);
    } else {
      console.log("Recent profiles:");
      console.log(JSON.stringify(profiles, null, 2));
    }

    // Let's also check if we can list database triggers using a REST query on Postgres schema,
    // or checking the auth.users triggers. Since REST endpoint is limited to defined tables,
    // we can try fetching database functions / triggers information using a postgres query if we have an RPC function.
    // Let's check what RPC functions are available or if we can run query.
    // Sometimes there is an rpc('exec_sql') or similar. Let's try.
    
  } catch (error) {
    console.error("Execution error:", error);
  }
}

run();
