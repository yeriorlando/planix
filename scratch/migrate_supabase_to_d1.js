import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = "https://otgxxepmyywilafqcuki.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3h4ZXBteXl3aWxhZnFjdWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk5ODIxMCwiZXhwIjoyMDg0NTc0MjEwfQ.4ju1xQUmW7wvfRxKg2ShGwkFCmbCn3TPmrrRwxL4-Ik";

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to paginate fetches because Supabase limit is 1000 records
async function fetchAll(table) {
  let allData = [];
  let from = 0;
  let to = 999;
  let hasMore = true;
  
  console.log(`Fetching from table '${table}'...`);
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
    console.log(`  Fetched ${data.length} records. Total so far: ${allData.length}`);
    
    if (data.length < 1000) {
      hasMore = false;
    } else {
      from += 1000;
      to += 1000;
    }
  }
  return allData;
}

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

const TARGET_GRADES = new Set(['1ro', '2do', '3ro', '4to', '5to', '6to']);

async function main() {
  console.log("=== STARTING CURRICULUM SYNC ===");
  
  // 1. Fetch raw datasets from Supabase
  const rawUnits = await fetchAll('units');
  const rawThemes = await fetchAll('unit_themes');
  const rawSubthemes = await fetchAll('unit_subthemes');
  
  console.log("Processing and building custom units SQL...");
  
  let sqlLines = [];
  sqlLines.push("-- Synced units, themes, and subthemes from Supabase reference to D1");
  sqlLines.push("CREATE TABLE IF NOT EXISTS custom_units (id TEXT PRIMARY KEY, subject_id TEXT NOT NULL, grade_id TEXT NOT NULL, content TEXT NOT NULL, updated_at TEXT NOT NULL);");
  
  let unitCount = 0;
  
  // Group themes by unit_id
  const themesByUnit = {};
  rawThemes.forEach(t => {
    if (!themesByUnit[t.unit_id]) {
      themesByUnit[t.unit_id] = [];
    }
    themesByUnit[t.unit_id].push(t);
  });
  
  // Group subthemes by theme_id
  const subthemesByTheme = {};
  rawSubthemes.forEach(st => {
    if (!subthemesByTheme[st.theme_id]) {
      subthemesByTheme[st.theme_id] = [];
    }
    subthemesByTheme[st.theme_id].push(st);
  });
  
  for (const u of rawUnits) {
    const rawSubject = u.subject_id;
    const cleanSubjectId = SUBJECT_MAP[rawSubject];
    
    // Skip if not in our 5 targeted subjects
    if (!cleanSubjectId) {
      continue;
    }
    
    // Find matching grade levels
    const gradeLevels = Array.isArray(u.grade_levels) ? u.grade_levels : [];
    const targetGradesInUnit = gradeLevels.filter(g => TARGET_GRADES.has(g));
    
    // Skip if no grade levels match 1ro, 2do, or 3ro
    if (targetGradesInUnit.length === 0) {
      continue;
    }
    
    // Fetch themes and subthemes for this unit
    const unitThemes = themesByUnit[u.id] || [];
    // Sort themes by order or default id
    unitThemes.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const themesList = unitThemes.map(t => {
      const themeSubthemes = subthemesByTheme[t.id] || [];
      themeSubthemes.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      return {
        id: t.id,
        name: t.title,
        subthemes: themeSubthemes.map(st => ({
          id: st.id,
          name: st.title
        }))
      };
    });
    
    // Extract achievement indicators
    const achievementIndicators = u.description
      ? u.description.split('\n').map(line => line.replace(/^[-•\t\s*]+/, '').trim()).filter(Boolean)
      : [];
      
    // Parse conceptual content blocks
    let conceptualBlocks = [];
    if (Array.isArray(u.conceptual_content) && u.conceptual_content.length > 0) {
      const firstItem = u.conceptual_content[0];
      if (typeof firstItem === 'string' && firstItem.trim().startsWith('{')) {
        try {
          conceptualBlocks = u.conceptual_content.map(str => JSON.parse(str));
        } catch (e) {
          console.error(`Failed to parse blocks JSON in unit ${u.id}:`, e);
        }
      }
    }
    
    // If we didn't parse blocks, fall back to legacy strings wrapping
    if (conceptualBlocks.length === 0) {
      conceptualBlocks = [{
        id: u.id + "-block-1",
        themes: themesList.map(t => t.name), // Associate to all themes by default
        conceptual: Array.isArray(u.conceptual_content) ? u.conceptual_content.join('\n') : '',
        procedural: Array.isArray(u.procedural_content) ? u.procedural_content.join('\n') : '',
        attitudinal: Array.isArray(u.attitudinal_content) ? u.attitudinal_content.join('\n') : ''
      }];
    }
    
    const now = new Date().toISOString();
    
    // Since custom_units stores single grade units on the UI, let's create a row for each grade level
    for (const gradeId of targetGradesInUnit) {
      const content = {
        id: u.id,
        name: u.title,
        themes: themesList,
        grade_levels: [gradeId],
        subjectId: cleanSubjectId,
        week_duration: u.week_duration || 4,
        description: u.description || '',
        achievementIndicators,
        conceptual_content: conceptualBlocks,
        procedural_content: [],
        attitudinal_content: []
      };
      
      const contentStr = JSON.stringify(content);
      
      // Escape single quotes for SQL insertion
      const escapedId = u.id.replace(/'/g, "''");
      const escapedSubjectId = cleanSubjectId.replace(/'/g, "''");
      const escapedGradeId = gradeId.replace(/'/g, "''");
      const escapedContentStr = contentStr.replace(/'/g, "''");
      
      sqlLines.push(`INSERT OR REPLACE INTO custom_units (id, subject_id, grade_id, content, updated_at) VALUES ('${escapedId}', '${escapedSubjectId}', '${escapedGradeId}', '${escapedContentStr}', '${now}');`);
      unitCount++;
    }
  }
  
  const sqlPath = path.resolve(process.cwd(), 'scratch', 'migrate_units.sql');
  fs.writeFileSync(sqlPath, sqlLines.join('\n'), 'utf8');
  console.log(`=== SQL GENERATION COMPLETE ===`);
  console.log(`Generated ${unitCount} D1 unit rows in: ${sqlPath}`);
}

main().catch(console.error);
