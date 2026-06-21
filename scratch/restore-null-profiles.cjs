const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://api.planix.do/";
const supabaseServiceKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDE3NDg2MCwiZXhwIjo0OTM1ODQ4NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.gWUTcE-79HrAIrZVqljSIdzxDDnrJbkfjVLPyq_nP_I";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Helper to normalize grade names
function mapGradeNameToId(gradeName, level) {
  if (!gradeName) return null;
  const clean = gradeName.toLowerCase();
  
  const isSec = clean.includes("secundaria") || (level && level.toLowerCase() === "secundaria");
  
  if (clean.includes("1ro") || clean.includes("primero") || clean.startsWith("1")) {
    return isSec ? "secundaria-1ro" : "primaria-1ro";
  }
  if (clean.includes("2do") || clean.includes("segundo") || clean.startsWith("2")) {
    return isSec ? "secundaria-2do" : "primaria-2do";
  }
  if (clean.includes("3ro") || clean.includes("tercero") || clean.startsWith("3")) {
    return isSec ? "secundaria-3ro" : "primaria-3ro";
  }
  if (clean.includes("4to") || clean.includes("cuarto") || clean.startsWith("4")) {
    return isSec ? "secundaria-4to" : "primaria-4to";
  }
  if (clean.includes("5to") || clean.includes("quinto") || clean.startsWith("5")) {
    return isSec ? "secundaria-5to" : "primaria-5to";
  }
  if (clean.includes("6to") || clean.includes("sexto") || clean.startsWith("6")) {
    return isSec ? "secundaria-6to" : "primaria-6to";
  }
  return isSec ? "secundaria-1ro" : "primaria-1ro";
}

function getCycleFromGrade(gradeId) {
  if (!gradeId) return "primaria-ciclo1";
  const num = gradeId.split("-")[1];
  const isSec = gradeId.startsWith("secundaria");
  
  if (num === "1ro" || num === "2do" || num === "3ro") {
    return isSec ? "secundaria-ciclo1" : "primaria-ciclo1";
  } else {
    return isSec ? "secundaria-ciclo2" : "primaria-ciclo2";
  }
}

async function run() {
  console.log("Fetching profiles with null academic values...");
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .or('nivel_principal.is.null,ciclo_principal.is.null,grado_principal.is.null');
    
  if (pErr) {
    console.error("Error fetching profiles:", pErr);
    return;
  }
  
  console.log(`Found ${profiles.length} profiles to analyze.`);
  
  let restoredCount = 0;
  
  for (const profile of profiles) {
    console.log(`\nAnalyzing ${profile.full_name} (${profile.email})...`);
    
    // Fetch plannings for this user
    const { data: plannings, error: plErr } = await supabase
      .from('plannings')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
      
    if (plErr) {
      console.error(`  Error fetching plannings:`, plErr);
      continue;
    }
    
    if (!plannings || plannings.length === 0) {
      console.log(`  No plannings found. Skipping.`);
      continue;
    }
    
    console.log(`  Found ${plannings.length} plannings. Deducing academic details...`);
    
    // Let's collect unique grades and subjects
    const allowed_subjects = {};
    let deducedLevel = "PRIMARIA";
    let deducedGradeId = null;
    
    plannings.forEach(p => {
      // Extract subject and grade from database columns or from content
      let subjId = p.subject_id;
      let grId = p.grade_id;
      
      const content = typeof p.content === 'string' ? JSON.parse(p.content) : (p.content || {});
      const fd = content.formData || {};
      
      const rawGrade = fd.grado || grId || p.grade_id;
      const rawSubject = fd.area || subjId || p.subject_id;
      
      let level = p.type === 'secundaria' || (rawGrade && rawGrade.toLowerCase().includes('secundaria')) ? 'SECUNDARIA' : 'PRIMARIA';
      if (level === 'SECUNDARIA') deducedLevel = 'SECUNDARIA';
      
      const mappedGradeId = mapGradeNameToId(rawGrade, level);
      
      if (mappedGradeId) {
        if (!deducedGradeId) deducedGradeId = mappedGradeId; // Latest planning grade
        
        // Clean subject ID (e.g. "lengua-espanola" instead of "lengua-espanola-1ro")
        let cleanSubj = (rawSubject || "").toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
          .replace(/[^a-z0-9]/g, "-") // replace symbols with -
          .replace(/-+/g, "-") // deduplicate -
          .replace(/-1ro|-2do|-3ro|-4to|-5to|-6to/g, "") // strip grade suffix if any
          .trim();
          
        if (cleanSubj.endsWith("-")) cleanSubj = cleanSubj.slice(0, -1);
        if (cleanSubj.startsWith("-")) cleanSubj = cleanSubj.slice(1);
        
        if (cleanSubj) {
          if (!allowed_subjects[mappedGradeId]) {
            allowed_subjects[mappedGradeId] = [];
          }
          if (!allowed_subjects[mappedGradeId].includes(cleanSubj)) {
            allowed_subjects[mappedGradeId].push(cleanSubj);
          }
        }
      }
    });
    
    if (!deducedGradeId) {
      // Fallback
      deducedGradeId = deducedLevel === 'SECUNDARIA' ? 'secundaria-1ro' : 'primaria-1ro';
    }
    
    const deducedCiclo = getCycleFromGrade(deducedGradeId);
    
    console.log(`  Deduced Level: ${deducedLevel}`);
    console.log(`  Deduced Grade: ${deducedGradeId}`);
    console.log(`  Deduced Cycle: ${deducedCiclo}`);
    console.log(`  Deduced Allowed Subjects:`, allowed_subjects);
    
    // Update profile
    const { error: updErr } = await supabase
      .from('profiles')
      .update({
        nivel_principal: deducedLevel,
        ciclo_principal: deducedCiclo,
        grado_principal: deducedGradeId,
        allowed_subjects: allowed_subjects,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);
      
    if (updErr) {
      console.error(`  Error updating profile:`, updErr);
    } else {
      console.log(`  [SUCCESS] Profile successfully restored!`);
      restoredCount++;
    }
  }
  
  console.log(`\nRestoration complete. Restored ${restoredCount} profiles.`);
}

run();
