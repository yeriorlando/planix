import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Import the static curriculum data from the active workspace
import { UNIT_CURRICULUM_DATA } from '../src/lib/data/unitCurriculum.js';

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, supabaseKey);

// Subject normalization mapper
const SUBJECT_MAP = {
  'sociales': 'sociales',
  'sociales-1ro': 'sociales',
  'sociales-2do': 'sociales',
  'sociales-3ro': 'sociales',
  'sociales-4to': 'sociales',
  'sociales-5to': 'sociales',
  'sociales-6to': 'sociales',
  
  'naturales': 'naturales',
  'naturales-1ro': 'naturales',
  'naturales-2do': 'naturales',
  'naturales-3ro': 'naturales',
  'naturales-4to': 'naturales',
  'naturales-5to': 'naturales',
  'naturales-6to': 'naturales',
  
  'formacion-humana': 'formacion-humana',
  'formacion-humana-1ro': 'formacion-humana',
  'formacion-humana-2do': 'formacion-humana',
  'formacion-humana-3ro': 'formacion-humana',
  'formacion-humana-4to': 'formacion-humana',
  'formacion-humana-5to': 'formacion-humana',
  'formacion-humana-6to': 'formacion-humana',
  
  'educacion-fisica': 'educacion-fisica',
  'educacion-fisica-1ro': 'educacion-fisica',
  'educacion-fisica-2do': 'educacion-fisica',
  'educacion-fisica-3ro': 'educacion-fisica',
  'educacion-fisica-4to': 'educacion-fisica',
  'educacion-fisica-5to': 'educacion-fisica',
  'educacion-fisica-6to': 'educacion-fisica',
  
  'educacion-artistica': 'educacion-artistica',
  'educacion-artistica-1ro': 'educacion-artistica',
  'educacion-artistica-2do': 'educacion-artistica',
  'educacion-artistica-3ro': 'educacion-artistica',
  'educacion-artistica-4to': 'educacion-artistica',
  'educacion-artistica-5to': 'educacion-artistica',
  'educacion-artistica-6to': 'educacion-artistica'
};

async function fetchAll(table) {
  let allData = [];
  let from = 0;
  let to = 999;
  let hasMore = true;
  
  console.log(`Fetching from Supabase table '${table}'...`);
  while (hasMore) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, to);
      
    if (error) {
      console.error(`Error querying ${table}:`, error);
      throw error;
    }
    
    allData = allData.concat(data);
    if (data.length < 1000) {
      hasMore = false;
    } else {
      from += 1000;
      to += 1000;
    }
  }
  return allData;
}

// Function to classify line to see if it is relevant to the static unit keywords
function isLineRelevant(line, staticUnitName) {
  const normLine = line.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normUnitName = staticUnitName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Naturales 4to
  if (normUnitName.includes("celula")) {
    return /celula|celular|seres vivos|biodiversidad|plantas|animales|reproducc|hered|vida/i.test(normLine);
  }
  if (normUnitName.includes("nutricion") || normUnitName.includes("sistemas del cuerpo")) {
    return /nutric|fotosin|energia|ecosist|cuerpo|salud|enfermedad|digest|circul|respir|excret|nervi|reprod|pubert|aliment|crecim|postura|osteomuscular/i.test(normLine);
  }
  if (normUnitName.includes("materia") || normUnitName.includes("maquinas")) {
    return /materia|energia|maquina|luz|sonido|fisi/i.test(normLine);
  }
  if (normUnitName.includes("tierra") || normUnitName.includes("recursos")) {
    return /tierra|capas|recursos|agua|aire|mineral|roca|sismo|universo|sol|luna|planeta/i.test(normLine);
  }
  
  // Naturales 5to
  if (normUnitName.includes("sistemas del cuerpo") || normUnitName.includes("salud")) {
    return /cuerpo|salud|sistema|circulatorio|respiratorio|digestivo|nervioso|reproductor|enfermedad|nutric|celula|vida/i.test(normLine);
  }
  if (normUnitName.includes("transformaciones") || normUnitName.includes("materia")) {
    return /materia|energia|fisi|quimic|transforma|calor|temperatura|luz|sonido|electricidad|magnetismo/i.test(normLine);
  }
  if (normUnitName.includes("recursos") || normUnitName.includes("universo")) {
    return /tierra|recursos|agua|aire|suelo|mineral|roca|sismo|universo|sol|luna|planeta|atmosfera/i.test(normLine);
  }
  
  // Naturales 6to
  if (normUnitName.includes("seres vivos") || normUnitName.includes("medio")) {
    return /seres vivos|ecosistema|biodiversidad|medio|planta|animal|celula|vida|reproduccion/i.test(normLine);
  }
  if (normUnitName.includes("fuerza") || normUnitName.includes("movimiento") || normUnitName.includes("maquinas")) {
    return /fuerza|movimiento|maquina|energia|fisi|trabajo|velocidad|aceleracion/i.test(normLine);
  }
  if (normUnitName.includes("planeta tierra") || normUnitName.includes("universo")) {
    return /tierra|universo|sol|luna|planeta|galaxia|estrella|atmosfera|clima/i.test(normLine);
  }

  // Sociales 4to
  if (normUnitName.includes("geografia")) {
    return /geogra|caribe|antillas|mapa|limite|relieve|clima|isla/i.test(normLine);
  }
  if (normUnitName.includes("historia") || normUnitName.includes("colonial") || normUnitName.includes("independencia")) {
    return /historia|colonial|independencia|origen|pueblo|taíno|español|siglo|héroe|patria/i.test(normLine);
  }
  if (normUnitName.includes("constitucion") || normUnitName.includes("derechos")) {
    return /constitucion|derechos|deberes|ciudadan|ley|democracia|norma|vial/i.test(normLine);
  }

  // Sociales 5to
  if (normUnitName.includes("geografia de america")) {
    return /geogra|america|caribe|mapa|limite|relieve|clima|continente/i.test(normLine);
  }
  if (normUnitName.includes("isla de santo domingo") || normUnitName.includes("siglos xvii")) {
    return /isla|santo domingo|colonia|frances|español|contrabando|tratado|siglo/i.test(normLine);
  }
  if (normUnitName.includes("independencia") || normUnitName.includes("nacimiento")) {
    return /independencia|trinitaria|duarte|anexión|restauración|república|haitiana/i.test(normLine);
  }

  // Sociales 6to
  if (normUnitName.includes("geografia mundial")) {
    return /geogra|mundial|continente|oceano|paralelo|meridiano|caribe/i.test(normLine);
  }
  if (normUnitName.includes("siglo xx") || normUnitName.includes("contemporaneo")) {
    return /siglo xx|contemporaneo|dictadura|trujillo|intervencion|revolucion|democracia/i.test(normLine);
  }
  if (normUnitName.includes("constitucion") || normUnitName.includes("ciudadania")) {
    return /constitucion|derechos|deberes|ciudadan|poderes|voto|paz|resolucion/i.test(normLine);
  }

  return true; // default fallback
}

async function main() {
  console.log("=== SECOND CYCLE CURRICULUM MAPPING AND SEED ===");
  
  // 1. Fetch raw datasets from Supabase
  const rawUnits = await fetchAll('units');
  const rawThemes = await fetchAll('unit_themes');
  const rawSubthemes = await fetchAll('unit_subthemes');
  
  // Group Supabase data
  const themesByUnit = {};
  rawThemes.forEach(t => {
    if (!themesByUnit[t.unit_id]) {
      themesByUnit[t.unit_id] = [];
    }
    themesByUnit[t.unit_id].push(t);
  });
  
  const subthemesByTheme = {};
  rawSubthemes.forEach(st => {
    if (!subthemesByTheme[st.theme_id]) {
      subthemesByTheme[st.theme_id] = [];
    }
    subthemesByTheme[st.theme_id].push(st);
  });
  
  let sqlLines = [];
  sqlLines.push("-- Synced units, themes, subthemes, and content blocks mapped to static IDs in unitCurriculum.ts");
  sqlLines.push("CREATE TABLE IF NOT EXISTS custom_units (id TEXT PRIMARY KEY, subject_id TEXT NOT NULL, grade_id TEXT NOT NULL, content TEXT NOT NULL, updated_at TEXT NOT NULL);");
  
  let mappedCount = 0;
  
  // Iterate over static curriculum data from the active workspace
  for (const subjectUnits of UNIT_CURRICULUM_DATA) {
    const staticSubjectId = subjectUnits.subjectId;
    const staticGrade = subjectUnits.grade;
    
    // Only map 2nd Cycle: 4to, 5to, 6to
    if (!['4to', '5to', '6to'].includes(staticGrade)) {
      continue;
    }
    
    console.log(`Mapping static subject: ${staticSubjectId}, grade: ${staticGrade}...`);
    
    // Get all Supabase units for this subject and grade
    const matchUnitsFromSupabase = rawUnits.filter(u => {
      const cleanSub = SUBJECT_MAP[u.subject_id];
      const grades = Array.isArray(u.grade_levels) ? u.grade_levels : [];
      return cleanSub === staticSubjectId && grades.includes(staticGrade);
    });
    
    console.log(`  Found ${matchUnitsFromSupabase.length} units in Supabase for this subject and grade.`);
    
    for (const staticUnit of subjectUnits.units) {
      console.log(`    Mapping static unit: ${staticUnit.id} - "${staticUnit.name}"...`);
      
      // Determine which Supabase unit(s) match this static unit
      let selectedSupaUnits = [];
      
      if (matchUnitsFromSupabase.length === 1) {
        // Only one unit in Supabase, maps directly
        selectedSupaUnits = [matchUnitsFromSupabase[0]];
      } else if (matchUnitsFromSupabase.length > 1) {
        // Multiple units in Supabase, search for matches based on name keywords
        const normStaticName = staticUnit.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Find best match by checking title overlap
        let bestMatch = null;
        let bestOverlap = 0;
        
        matchUnitsFromSupabase.forEach(su => {
          const normSupaTitle = su.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          
          // Count word matches
          const staticWords = normStaticName.split(/\s+/).filter(w => w.length > 3);
          const supaWords = normSupaTitle.split(/\s+/).filter(w => w.length > 3);
          
          let overlap = 0;
          staticWords.forEach(sw => {
            if (supaWords.some(suw => suw.includes(sw) || sw.includes(suw))) {
              overlap++;
            }
          });
          
          if (overlap > bestOverlap) {
            bestOverlap = overlap;
            bestMatch = su;
          }
        });
        
        if (bestMatch) {
          selectedSupaUnits = [bestMatch];
        } else {
          // Subject specific logic
          if (staticSubjectId === 'naturales') {
            if (normStaticName.includes("celula") || normStaticName.includes("vida") || normStaticName.includes("nutricion") || normStaticName.includes("cuerpo")) {
              selectedSupaUnits = matchUnitsFromSupabase.filter(su => su.title.toLowerCase().includes("vida"));
            } else if (normStaticName.includes("materia") || normStaticName.includes("fisi") || normStaticName.includes("energia") || normStaticName.includes("maquina")) {
              selectedSupaUnits = matchUnitsFromSupabase.filter(su => su.title.toLowerCase().includes("fisica"));
            } else if (normStaticName.includes("tierra") || normStaticName.includes("recurso") || normStaticName.includes("universo")) {
              selectedSupaUnits = matchUnitsFromSupabase.filter(su => su.title.toLowerCase().includes("tierra"));
            }
          } else if (staticSubjectId === 'sociales') {
            if (normStaticName.includes("geografia") || normStaticName.includes("patria")) {
              selectedSupaUnits = matchUnitsFromSupabase.filter(su => su.title.toLowerCase().includes("geografia") || su.title.toLowerCase().includes("patrimonio"));
            } else if (normStaticName.includes("historia") || normStaticName.includes("colonial") || normStaticName.includes("independencia") || normStaticName.includes("siglo")) {
              selectedSupaUnits = matchUnitsFromSupabase.filter(su => su.title.toLowerCase().includes("origen") || su.title.toLowerCase().includes("siglo") || su.title.toLowerCase().includes("historia") || su.title.toLowerCase().includes("america") || su.title.toLowerCase().includes("dominicana"));
            } else if (normStaticName.includes("constitucion") || normStaticName.includes("derechos") || normStaticName.includes("ciudadania")) {
              selectedSupaUnits = matchUnitsFromSupabase.filter(su => su.title.toLowerCase().includes("ciudadana") || su.title.toLowerCase().includes("convivencia"));
            }
          } else if (staticSubjectId === 'educacion-artistica') {
            if (normStaticName.includes("visuales") || normStaticName.includes("dibujo") || normStaticName.includes("pintura")) {
              selectedSupaUnits = matchUnitsFromSupabase.filter(su => su.title.toLowerCase().includes("visual") || su.title.toLowerCase().includes("conceptos"));
            } else if (normStaticName.includes("escenicas") || normStaticName.includes("teatro") || normStaticName.includes("titeres")) {
              selectedSupaUnits = matchUnitsFromSupabase.filter(su => su.title.toLowerCase().includes("escenic") || su.title.toLowerCase().includes("aplicad"));
            } else if (normStaticName.includes("musica") || normStaticName.includes("canto") || normStaticName.includes("coral")) {
              selectedSupaUnits = matchUnitsFromSupabase.filter(su => su.title.toLowerCase().includes("music"));
            }
          }
          
          // Fallback if still empty
          if (selectedSupaUnits.length === 0) {
            selectedSupaUnits = [matchUnitsFromSupabase[0]];
          }
        }
      }
      
      console.log(`      Selected Supabase unit(s): ${selectedSupaUnits.map(su => su.title).join(', ')}`);
      
      // If we found matching Supabase units, extract their conceptual, procedural, and attitudinal content blocks
      let combinedConceptual = [];
      let combinedProcedural = [];
      let combinedAttitudinal = [];
      
      selectedSupaUnits.forEach(su => {
        if (Array.isArray(su.conceptual_content)) {
          combinedConceptual = combinedConceptual.concat(su.conceptual_content);
        }
        if (Array.isArray(su.procedural_content)) {
          combinedProcedural = combinedProcedural.concat(su.procedural_content);
        }
        if (Array.isArray(su.attitudinal_content)) {
          combinedAttitudinal = combinedAttitudinal.concat(su.attitudinal_content);
        }
      });
      
      // Filter lines to be specific to this static unit's subthemes/keywords
      const filteredConceptual = combinedConceptual.filter(line => isLineRelevant(line, staticUnit.name));
      const filteredProcedural = combinedProcedural.filter(line => isLineRelevant(line, staticUnit.name));
      const filteredAttitudinal = combinedAttitudinal.filter(line => isLineRelevant(line, staticUnit.name));
      
      // If the filter removed too many lines, fallback to using all lines from the matched units
      const finalConceptual = filteredConceptual.length > 1 ? filteredConceptual : combinedConceptual;
      const finalProcedural = filteredProcedural.length > 1 ? filteredProcedural : combinedProcedural;
      const finalAttitudinal = filteredAttitudinal.length > 1 ? filteredAttitudinal : combinedAttitudinal;
      
      // Format as standard ContentBlock
      const contentBlock = {
        id: `${staticUnit.id}-block-1`,
        themes: staticUnit.themes.map(t => t.name), // Associate to all themes of this static unit
        conceptual: finalConceptual.join('\n'),
        procedural: finalProcedural.join('\n'),
        attitudinal: finalAttitudinal.join('\n')
      };
      
      // Extract indicators
      let achievementIndicators = [];
      selectedSupaUnits.forEach(su => {
        if (su.description) {
          const indicators = su.description.split('\n').map(line => line.replace(/^[-•\t\s*]+/, '').trim()).filter(Boolean);
          achievementIndicators = achievementIndicators.concat(indicators);
        }
      });
      
      // If no indicators extracted, check if static unit already had them
      if (achievementIndicators.length === 0 && Array.isArray(staticUnit.achievementIndicators)) {
        achievementIndicators = staticUnit.achievementIndicators;
      }
      
      const now = new Date().toISOString();
      const content = {
        id: staticUnit.id,
        name: staticUnit.name,
        themes: staticUnit.themes,
        grade_levels: [staticGrade],
        subjectId: staticSubjectId,
        week_duration: staticUnit.week_duration || 4,
        description: staticUnit.description || '',
        achievementIndicators,
        conceptual_content: [contentBlock],
        procedural_content: [],
        attitudinal_content: []
      };
      
      const contentStr = JSON.stringify(content);
      
      // Escape single quotes for SQL insertion
      const escapedId = staticUnit.id.replace(/'/g, "''");
      const escapedSubjectId = staticSubjectId.replace(/'/g, "''");
      const escapedGradeId = staticGrade.replace(/'/g, "''");
      const escapedContentStr = contentStr.replace(/'/g, "''");
      
      sqlLines.push(`INSERT OR REPLACE INTO custom_units (id, subject_id, grade_id, content, updated_at) VALUES ('${escapedId}', '${escapedSubjectId}', '${escapedGradeId}', '${escapedContentStr}', '${now}');`);
      mappedCount++;
    }
  }
  
  const sqlPath = path.resolve(process.cwd(), 'scratch', 'seed_2nd_cycle_units.sql');
  fs.writeFileSync(sqlPath, sqlLines.join('\n'), 'utf8');
  console.log(`=== MAPPING COMPLETE ===`);
  console.log(`Generated ${mappedCount} D1 unit rows in: ${sqlPath}`);
}

main().catch(console.error);
