const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = "https://api.planix.do/";
const supabaseServiceKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  console.log("Connecting to Supabase...");
  
  // 1. Fetch Ephemerides
  console.log("Fetching ephemerides...");
  const { data: ephemerides, error: ephError } = await supabase
    .from('ephemerides')
    .select('*');

  if (ephError) {
    console.error("Error fetching ephemerides:", ephError);
    return;
  }
  console.log(`Fetched ${ephemerides.length} ephemerides.`);

  // 2. Fetch Monthly Values
  console.log("Fetching monthly_values...");
  const { data: monthlyValues, error: mvError } = await supabase
    .from('monthly_values')
    .select('*');

  if (mvError) {
    console.error("Error fetching monthly_values (it might not exist or be empty):", mvError.message);
  } else {
    console.log(`Fetched ${monthlyValues ? monthlyValues.length : 0} monthly values.`);
  }

  // 3. Generate SQL script
  const sqlLines = [];
  sqlLines.push("-- SQL dump of ephemerides and monthly_values from Supabase to D1");
  sqlLines.push("CREATE TABLE IF NOT EXISTS ephemerides (id TEXT PRIMARY KEY, day INTEGER NOT NULL, month INTEGER NOT NULL, title TEXT NOT NULL, description TEXT, is_holiday INTEGER DEFAULT 0, category TEXT DEFAULT 'EDUCATIVA', created_at TEXT DEFAULT CURRENT_TIMESTAMP);");
  sqlLines.push("CREATE TABLE IF NOT EXISTS monthly_values (month INTEGER PRIMARY KEY, value_name TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);");
  sqlLines.push("");

  // Insert ephemerides
  if (ephemerides && ephemerides.length > 0) {
    sqlLines.push("-- Insert Ephemerides");
    ephemerides.forEach(e => {
      const id = e.id.replace(/'/g, "''");
      const day = Number(e.day);
      const month = Number(e.month);
      const title = (e.title || "").replace(/'/g, "''");
      const description = (e.description || "").replace(/'/g, "''");
      const is_holiday = e.is_holiday ? 1 : 0;
      const category = (e.category || "EDUCATIVA").replace(/'/g, "''");
      
      sqlLines.push(`INSERT OR REPLACE INTO ephemerides (id, day, month, title, description, is_holiday, category) VALUES ('${id}', ${day}, ${month}, '${title}', '${description}', ${is_holiday}, '${category}');`);
    });
    sqlLines.push("");
  }

  // Insert monthly values
  if (monthlyValues && monthlyValues.length > 0) {
    sqlLines.push("-- Insert Monthly Values");
    monthlyValues.forEach(mv => {
      const month = Number(mv.month);
      const value_name = (mv.value_name || "").replace(/'/g, "''");
      sqlLines.push(`INSERT OR REPLACE INTO monthly_values (month, value_name) VALUES (${month}, '${value_name}');`);
    });
    sqlLines.push("");
  }

  const sqlPath = path.join(__dirname, 'seed_ephemerides_d1.sql');
  fs.writeFileSync(sqlPath, sqlLines.join('\n'), 'utf8');
  console.log(`Generated SQL seed file at: ${sqlPath}`);
}

run().catch(err => {
  console.error("Unhandled error:", err);
});
