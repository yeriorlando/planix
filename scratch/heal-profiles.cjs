const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://api.planix.do/";
const supabaseServiceKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  console.log("Fetching profiles that have N/A regional, distrito, or municipio fields...");
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, school_name, regional, distrito, municipio');

  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  const profilesToHeal = profiles.filter(p => {
    if (!p.school_name || p.school_name.trim() === '') return false;
    const isNA = 
      p.regional === 'N/A' || p.regional === 'NA' || !p.regional ||
      p.distrito === 'N/A' || p.distrito === 'NA' || !p.distrito ||
      p.municipio === 'N/A' || p.municipio === 'NA' || !p.municipio;
    return isNA;
  });

  console.log(`Found ${profilesToHeal.length} profiles to analyze/heal.`);

  let healedCount = 0;
  let notFoundCount = 0;

  for (const profile of profilesToHeal) {
    const schoolName = profile.school_name.trim();
    console.log(`\nAnalyzing: "${profile.full_name}" (${profile.email}) - School: "${schoolName}"`);

    // Look up the school in schools table
    const { data: matchedSchools, error: sErr } = await supabase
      .from('schools')
      .select('regional, district, municipality')
      .ilike('name', schoolName)
      .limit(1);

    if (sErr) {
      console.error(`  Error querying school "${schoolName}":`, sErr);
      continue;
    }

    if (matchedSchools && matchedSchools.length > 0) {
      const school = matchedSchools[0];
      const regionalVal = school.regional || 'N/A';
      const distritoVal = school.district || 'N/A';
      const municipioVal = school.municipality || 'N/A';

      console.log(`  Found match! Regional: "${regionalVal}", Distrito: "${distritoVal}", Municipio: "${municipioVal}"`);

      // Update in Supabase
      const { error: updErr } = await supabase
        .from('profiles')
        .update({
          regional: regionalVal,
          distrito: distritoVal,
          municipio: municipioVal,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updErr) {
        console.error(`  Error updating profile:`, updErr);
      } else {
        console.log(`  [HEALED] Profile successfully updated.`);
        healedCount++;
      }
    } else {
      console.log(`  [NOT FOUND] No exact match in schools table for "${schoolName}".`);
      notFoundCount++;
    }
  }

  console.log(`\nHeal completed.`);
  console.log(`Total healed: ${healedCount}`);
  console.log(`Total not matched/not healed: ${notFoundCount}`);
}

run();
