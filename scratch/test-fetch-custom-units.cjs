const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, serviceRoleKey);

const normalizeSubject = (subId) => {
  let clean = (subId || "").toLowerCase().trim();
  clean = clean.replace(/-(1ro|2do|3ro|4to|5to|6to)$/, '');
  if (clean === 'ciencias-sociales') return 'sociales';
  if (clean === 'ciencias-naturaleza') return 'naturales';
  if (clean === 'formacion-integral-humana-y-religiosa') return 'formacion-humana';
  return clean;
};

const normalizeGrade = (subId, gradeLevels) => {
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
};

async function run() {
  try {
    console.log("Fetching units...");
    const { data: units, error: unitsErr } = await supabase.from("units").select("*");
    if (unitsErr) throw unitsErr;
    console.log(`Fetched ${units.length} units.`);

    console.log("Fetching themes...");
    const { data: themes, error: themesErr } = await supabase.from("unit_themes").select("*").order("order", { ascending: true });
    if (themesErr) throw themesErr;
    console.log(`Fetched ${themes.length} themes.`);

    console.log("Fetching subthemes...");
    const { data: subthemes, error: subthemesErr } = await supabase.from("unit_subthemes").select("*").order("order", { ascending: true });
    if (subthemesErr) throw subthemesErr;
    console.log(`Fetched ${subthemes.length} subthemes.`);

    const stitched = units.map(u => {
      const themesForUnit = themes.filter(t => t.unit_id === u.id);
      const formattedThemes = themesForUnit.map(t => {
        const subthemesForTheme = subthemes.filter(s => s.theme_id === t.id);
        return {
          id: t.id,
          name: t.title,
          subthemes: subthemesForTheme.map(s => ({
            id: s.id,
            name: s.title
          }))
        };
      });

      const conceptualText = Array.isArray(u.conceptual_content) ? u.conceptual_content.join("\n") : (u.conceptual_content || "");
      const proceduralText = Array.isArray(u.procedural_content) ? u.procedural_content.join("\n") : (u.procedural_content || "");
      const attitudinalText = Array.isArray(u.attitudinal_content) ? u.attitudinal_content.join("\n") : (u.attitudinal_content || "");

      const normSubject = normalizeSubject(u.subject_id);
      const normGrade = normalizeGrade(u.subject_id, u.grade_levels || []);

      const content = {
        id: u.id,
        name: u.title,
        themes: formattedThemes,
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

      return {
        id: u.id,
        subject_id: normSubject,
        grade_id: normGrade,
        content: content,
        updated_at: u.updated_at || new Date().toISOString()
      };
    });

    console.log(`Successfully stitched ${stitched.length} units.`);
    const sociales4to = stitched.filter(s => s.subject_id === 'sociales' && s.grade_id === '4to');
    console.log(`Found ${sociales4to.length} units for sociales 4to:`);
    sociales4to.forEach(u => {
      console.log(`- ${u.content.name} (${u.content.themes.length} themes, ${u.content.themes.flatMap(t=>t.subthemes).length} subthemes)`);
    });
  } catch (err) {
    console.error("Error running test:", err);
  }
}

run();
