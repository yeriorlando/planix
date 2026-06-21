const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

function normalizeSubject(subId) {
  let clean = subId.toLowerCase().trim();
  // Remove trailing grade
  clean = clean.replace(/-(1ro|2do|3ro|4to|5to|6to)$/, '');
  // Normalize names to match frontend expectations
  if (clean === 'ciencias-sociales') return 'sociales';
  if (clean === 'ciencias-naturaleza') return 'naturales';
  if (clean === 'formacion-integral-humana-y-religiosa') return 'formacion-humana';
  return clean;
}

function normalizeGrade(subId, gradeLevels) {
  let g = "";
  if (gradeLevels && gradeLevels.length > 0) {
    g = gradeLevels[0].toLowerCase();
  } else {
    g = subId.toLowerCase();
  }
  
  if (g.includes('1ro') || g.includes('1er')) return '1ro';
  if (g.includes('2do')) return '2do';
  if (g.includes('3ro') || g.includes('3er')) return '3ro';
  if (g.includes('4to')) return '4to';
  if (g.includes('5to')) return '5to';
  if (g.includes('6to')) return '6to';
  
  return '2do'; // fallback
}

async function run() {
  try {
    const headers = {
      "apikey": serviceRoleKey,
      "Authorization": `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json"
    };

    console.log("Fetching units...");
    const resUnits = await fetch(`${supabaseUrl}/rest/v1/units?select=*`, { headers });
    if (!resUnits.ok) throw new Error(`Units fetch failed: ${resUnits.status}`);
    const units = await resUnits.json();
    console.log(`Loaded ${units.length} units.`);

    console.log("Fetching unit_themes...");
    const resThemes = await fetch(`${supabaseUrl}/rest/v1/unit_themes?select=*`, { headers });
    if (!resThemes.ok) throw new Error(`Themes fetch failed: ${resThemes.status}`);
    const unitThemes = await resThemes.json();
    console.log(`Loaded ${unitThemes.length} themes.`);

    console.log("Fetching unit_subthemes...");
    const resSubthemes = await fetch(`${supabaseUrl}/rest/v1/unit_subthemes?select=*`, { headers });
    if (!resSubthemes.ok) throw new Error(`Subthemes fetch failed: ${resSubthemes.status}`);
    const unitSubthemes = await resSubthemes.json();
    console.log(`Loaded ${unitSubthemes.length} subthemes.`);

    console.log("Stitching units together...");
    const stitchedUnits = [];
    for (const u of units) {
      const themesForUnit = unitThemes.filter(t => t.unit_id === u.id);
      
      const themes = themesForUnit.map(t => {
        const subthemesForTheme = unitSubthemes.filter(s => s.theme_id === t.id);
        return {
          id: t.id,
          name: t.title,
          subthemes: subthemesForTheme.map(s => ({
            id: s.id,
            name: s.title
          }))
        };
      });

      const normSubject = normalizeSubject(u.subject_id);
      const normGrade = normalizeGrade(u.subject_id, u.grade_levels);

      const conceptualText = Array.isArray(u.conceptual_content) ? u.conceptual_content.join("\n") : (u.conceptual_content || "");
      const proceduralText = Array.isArray(u.procedural_content) ? u.procedural_content.join("\n") : (u.procedural_content || "");
      const attitudinalText = Array.isArray(u.attitudinal_content) ? u.attitudinal_content.join("\n") : (u.attitudinal_content || "");

      const content = {
        id: u.id,
        name: u.title,
        themes: themes,
        grade_levels: u.grade_levels || [normGrade],
        subjectId: normSubject,
        week_duration: u.week_duration || 4,
        description: u.description || "",
        achievementIndicators: [],
        conceptual_content: [
          {
            id: `${u.id}-block-1`,
            themes: themesForUnit.map(t => t.title),
            conceptual: conceptualText,
            procedural: proceduralText,
            attitudinal: attitudinalText
          }
        ],
        procedural_content: [],
        attitudinal_content: []
      };

      stitchedUnits.push({
        id: u.id,
        subject_id: normSubject,
        grade_id: normGrade,
        content: content,
        updated_at: new Date().toISOString()
      });
    }

    console.log(`Prepared ${stitchedUnits.length} stitched units. Upserting into custom_units...`);
    
    // Upsert to custom_units in chunks of 20 to avoid payload size errors
    const chunkSize = 20;
    for (let i = 0; i < stitchedUnits.length; i += chunkSize) {
      const chunk = stitchedUnits.slice(i, i + chunkSize);
      const resUpsert = await fetch(`${supabaseUrl}/rest/v1/custom_units`, {
        method: "POST",
        headers: {
          ...headers,
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(chunk)
      });

      if (resUpsert.ok) {
        console.log(`Successfully upserted chunk ${i / chunkSize + 1} (${chunk.length} units).`);
      } else {
        console.error(`Failed to upsert chunk ${i / chunkSize + 1}:`, resUpsert.status, await resUpsert.text());
      }
    }

    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

run();
