import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== INSPECTING SUPABASE ===");

  // 1. Fetch tables summary
  const { data: units, error: uErr } = await supabase.from('units').select('*');
  if (uErr) {
    console.error("Error fetching units:", uErr);
    return;
  }
  console.log("Total units in Supabase:", units.length);

  // Check columns of the first unit
  if (units.length > 0) {
    console.log("Units table columns:", Object.keys(units[0]));
    console.log("Unit grade levels and subjects sample count:");
    const countMap = {};
    units.forEach(u => {
      const key = `${u.subject_id} - ${JSON.stringify(u.grade_levels)}`;
      countMap[key] = (countMap[key] || 0) + 1;
    });
    console.log(countMap);
  }

  // 2. Fetch unit_themes count
  const { data: themes, error: tErr } = await supabase.from('unit_themes').select('*');
  if (tErr) {
    console.error("Error fetching unit_themes:", tErr);
  } else {
    console.log("Total unit_themes in Supabase:", themes.length);
    if (themes.length > 0) {
      console.log("unit_themes sample:", themes[0]);
    }
  }

  // 3. Fetch unit_subthemes count
  const { data: subthemes, error: stErr } = await supabase.from('unit_subthemes').select('*');
  if (stErr) {
    console.error("Error fetching unit_subthemes:", stErr);
  } else {
    console.log("Total unit_subthemes in Supabase:", subthemes.length);
    if (subthemes.length > 0) {
      console.log("unit_subthemes sample:", subthemes[0]);
    }
  }
}

run();
