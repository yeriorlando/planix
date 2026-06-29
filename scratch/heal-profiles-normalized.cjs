const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://api.planix.do/";
const supabaseServiceKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

function normalizeText(text) {
  if (!text) return "";
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
    .replace(/[^a-z0-9]/g, "")      // Remove spaces, punctuation, symbols
    .trim();
}

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
  if (profilesToHeal.length === 0) {
    console.log("No profiles need healing. Exiting.");
    return;
  }

  console.log("Loading all schools from database for in-memory normalized matching...");
  let allSchools = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    console.log(`  Fetching schools page ${page + 1}...`);
    const { data: chunk, error: sErr } = await supabase
      .from('schools')
      .select('id, name, regional, district, municipality')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (sErr) {
      console.error("Error loading schools batch:", sErr);
      return;
    }

    if (chunk && chunk.length > 0) {
      allSchools = allSchools.concat(chunk);
      page++;
      if (chunk.length < pageSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }
  console.log(`Loaded ${allSchools.length} schools in total.`);

  // Create a map of normalized school names to their school object
  console.log("Creating normalized school names map...");
  const schoolMap = new Map();
  allSchools.forEach(school => {
    if (school.name) {
      const normalizedName = normalizeText(school.name);
      // Store the first one we see, or we could handle duplicates, but any valid regional info is fine
      if (!schoolMap.has(normalizedName)) {
        schoolMap.set(normalizedName, school);
      }
    }
  });

  let healedCount = 0;
  let notFoundCount = 0;

  for (const profile of profilesToHeal) {
    const schoolName = profile.school_name.trim();
    const normalizedProfileSchool = normalizeText(schoolName);

    console.log(`\nAnalyzing: "${profile.full_name}" (${profile.email}) - School: "${schoolName}"`);

    // Look up in our map
    const school = schoolMap.get(normalizedProfileSchool);

    if (school) {
      const regionalVal = school.regional || 'N/A';
      const distritoVal = school.district || 'N/A';
      const municipioVal = school.municipality || 'N/A';

      console.log(`  Found Match! "${school.name}"`);
      console.log(`  Regional: "${regionalVal}", Distrito: "${distritoVal}", Municipio: "${municipioVal}"`);

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
      console.log(`  [NOT FOUND] No normalized match found for school: "${schoolName}"`);
      notFoundCount++;
    }
  }

  console.log(`\nHeal completed.`);
  console.log(`Total healed: ${healedCount}`);
  console.log(`Total not matched/not healed: ${notFoundCount}`);
}

run();
