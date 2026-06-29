const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://api.planix.do/";
const supabaseServiceKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

function cleanWord(word) {
  if (!word) return "";
  return word.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "")      // Remove punctuation
    .trim();
}

const STOP_WORDS = new Set([
  "escuela", "basica", "colegio", "centro", "educativo", "liceo", "de", "del", "la", "el", "los", "las", "y", "en",
  "profesor", "prof", "profesora", "doctor", "dr", "dra", "inicial", "primaria", "secundaria", "artes", "politecnico",
  "multigrado", "tv", "prep", "preparatoria", "instituto", "parroquial", "cristiano", "evangelico", "reformado",
  "basico", "primario", "secundario", "nocturna", "experimental", "laboral", "fiscal"
]);

function getUniqueTokens(text) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const cleanWords = words.map(w => cleanWord(w)).filter(w => w.length > 1);
  return cleanWords.filter(w => !STOP_WORDS.has(w));
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

  console.log("Loading all schools from database for fuzzy token matching...");
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

  // Parse and pre-compute unique tokens for all schools
  console.log("Pre-computing school unique tokens...");
  const schoolsWithTokens = allSchools.map(school => {
    const tokens = getUniqueTokens(school.name);
    return {
      school,
      tokens,
      joinedTokens: tokens.join(" ")
    };
  }).filter(s => s.tokens.length > 0); // Keep only if there are significant unique words

  let healedCount = 0;
  let notFoundCount = 0;

  for (const profile of profilesToHeal) {
    const schoolName = profile.school_name.trim();
    const profileTokens = getUniqueTokens(schoolName);

    console.log(`\nAnalyzing: "${profile.full_name}" (${profile.email}) - School: "${schoolName}"`);
    console.log(`  Unique Tokens: [${profileTokens.join(", ")}]`);

    if (profileTokens.length === 0) {
      console.log(`  [SKIPPED] No significant unique words found in "${schoolName}".`);
      notFoundCount++;
      continue;
    }

    // Try to find a match by seeing if all profile tokens are contained in the school tokens
    let matchedCandidate = null;

    for (const item of schoolsWithTokens) {
      // Check if all profile tokens are present in the school tokens
      const match = profileTokens.every(pt => item.tokens.includes(pt));
      if (match) {
        matchedCandidate = item.school;
        break; // Stop at first match
      }
    }

    // If still no match, try token overlap (e.g. 70% or more overlap)
    if (!matchedCandidate && profileTokens.length >= 2) {
      for (const item of schoolsWithTokens) {
        let overlap = 0;
        profileTokens.forEach(pt => {
          if (item.tokens.includes(pt)) overlap++;
        });
        
        const overlapRatio = overlap / profileTokens.length;
        if (overlapRatio >= 0.75) {
          matchedCandidate = item.school;
          break;
        }
      }
    }

    if (matchedCandidate) {
      const regionalVal = matchedCandidate.regional || 'N/A';
      const distritoVal = matchedCandidate.district || 'N/A';
      const municipioVal = matchedCandidate.municipality || 'N/A';

      console.log(`  Found Match! "${matchedCandidate.name}"`);
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
      console.log(`  [NOT FOUND] No fuzzy token match found for school: "${schoolName}"`);
      notFoundCount++;
    }
  }

  console.log(`\nFuzzy Heal completed.`);
  console.log(`Total healed: ${healedCount}`);
  console.log(`Total not matched/not healed: ${notFoundCount}`);
}

run();
